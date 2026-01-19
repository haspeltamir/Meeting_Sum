from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from app.models import Job
from app.db import jobs_collection
from app.services.exporter import generate_docx
import shutil
import os

router = APIRouter()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

from app.services.transcription import transcribe_audio
from app.services.ai_analyst import analyze_transcript

async def process_meeting_task(job_id: str, file_path: str):
    try:
        # 5. Immediate Transition to avoid UI 'Pending' lag
        await jobs_collection.update_one(
            {"job_id": job_id}, 
            {"$set": {"status": "PROCESSING"}}
        )

        # Phase 2: Transcription Service
        transcript_text = await transcribe_audio(file_path)

        # Update MongoDB with transcript and move to next stage
        await jobs_collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "transcript": transcript_text,
                    "status": "SUMMARIZING" # Ready for Phase 3 (LLM)
                }
            }
        )

        # Phase 3: AI Analyst (Summarization)
        analysis_result = await analyze_transcript(transcript_text)

        # Final Update: Save analysis and Mark Complete
        await jobs_collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "analysis": analysis_result,
                    "status": "COMPLETED"
                }
            }
        )

    except Exception as e:
        print(f"Error processing job {job_id}: {e}")
        await jobs_collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "status": "FAILED",
                    "error_details": str(e)
                }
            }
        )
    finally:
        # Cleanup: Delete the temporary audio file
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/upload")
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # 1. Basic format validation
    if not file.filename.endswith(('.mp3', '.wav', '.m4a')):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # 2. Initialize Job
    new_job = Job(filename=file.filename)
    await jobs_collection.insert_one(new_job.model_dump())

    # 3. Collision Prevention: Prepend job_id to the filename
    unique_filename = f"{new_job.job_id}_{file.filename}"
    file_path = f"temp_uploads/{unique_filename}"
    
    os.makedirs("temp_uploads", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. Trigger Background Task
    background_tasks.add_task(process_meeting_task, new_job.job_id, file_path)

    return {"job_id": new_job.job_id, "status": new_job.status}

@router.get("/job/{job_id}")
async def get_job(job_id: str):
    job_dict = await jobs_collection.find_one({"job_id": job_id})
    if not job_dict:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Ensures the returned data strictly follows the Pydantic Job model
    return Job.model_validate(job_dict)

@router.get("/job/{job_id}/download")
async def download_report(job_id: str):
    # 1. Fetch Job
    job_data = await jobs_collection.find_one({"job_id": job_id})
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 2. Verify Status
    if job_data.get("status") != "COMPLETED":
        raise HTTPException(status_code=400, detail="Report generation not ready. Job status must be COMPLETED.")

    # 3. Generate Report
    output_dir = "temp_outputs"
    os.makedirs(output_dir, exist_ok=True)
    file_path = f"{output_dir}/{job_id}_report.docx"
    
    # Generate fresh every time (or could cache)
    generate_docx(job_data, file_path)

    # 4. Return File
    return FileResponse(
        path=file_path, 
        filename=f"Meeting_Report_{job_id}.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
