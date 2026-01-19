import asyncio
from app.db import jobs_collection
from app.models import Job, MeetingAnalysis, ActionItem
from datetime import datetime
import uuid

async def seed():
    job_id = "test-export-job"
    
    analysis = MeetingAnalysis(
        summary="The team met to discuss the Q3 roadmap. It was decided to prioritize the mobile app launch.",
        participants=["Alice", "Bob", "Charlie"],
        decisions=["Launch mobile app in September", "Hire 2 new devs"],
        action_items=[
            ActionItem(task="Draft PR", owner="Alice", due_date="2023-10-01"),
            ActionItem(task="Interview candidates", owner="Bob", due_date="2023-10-15")
        ]
    )

    job = Job(
        job_id=job_id,
        status="COMPLETED",
        filename="test_meeting.mp3",
        transcript="Alice: Let's launch in Sept. Bob: Agreed. Charlie: We need more devs.",
        analysis=analysis,
        created_at=datetime.utcnow()
    )

    # Clean existing
    await jobs_collection.delete_one({"job_id": job_id})
    
    # Insert
    await jobs_collection.insert_one(job.model_dump())
    print(f"Seeded job: {job_id}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(seed())
