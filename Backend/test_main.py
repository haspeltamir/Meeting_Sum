import os
import time
import uuid
from fastapi.testclient import TestClient
from main import app, UPLOAD_DIR
from database import engine, SQLModel

# Setup/Teardown
def setup_module(module):
    SQLModel.metadata.create_all(engine)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def teardown_module(module):
    # Clean up simple db file if needed, or just leave it
    pass

client = TestClient(app)

def test_upload_flow():
    # 1. Create a dummy file
    dummy_file_content = b"fake audio content"
    
    # 2. Upload
    response = client.post(
        "/api/upload",
        files={"file": ("test_audio.mp3", dummy_file_content, "audio/mpeg")}
    )
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    job_id = data["job_id"]
    assert data["status"] == "PENDING"
    
    # 3. Poll Status
    # Since BackgroundTasks run synchronously in TestClient (usually), check immediately
    # BUT we used async sleep in background task, and TestClient might not await it properly 
    # if it's not fully async-aware or if we don't use AsyncClient.
    # However, standard TestClient runs background tasks after the response is sent.
    
    # Let's poll loop just in case
    for _ in range(10):
        response = client.get(f"/api/job/{job_id}")
        assert response.status_code == 200
        status_data = response.json()
        if status_data["status"] == "COMPLETED":
            break
        time.sleep(1)
        
    assert status_data["status"] == "COMPLETED"
    assert status_data["result"]["transcript"] == "This is a dummy transcript used for validation."

    # 4. Download
    response = client.get(f"/api/job/{job_id}/download")
    assert response.status_code == 200
    assert response.headers["content-disposition"].startswith("attachment; filename=")
