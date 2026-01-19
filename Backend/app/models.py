from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class ActionItem(BaseModel):
    task: str
    owner: Optional[str] = None
    due_date: Optional[str] = None

class MeetingAnalysis(BaseModel):
    summary: Optional[str] = None
    participants: List[str] = Field(default_factory=list)
    decisions: List[str] = Field(default_factory=list)
    action_items: List[ActionItem] = Field(default_factory=list)

class Job(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "PENDING"  # PENDING, PROCESSING, COMPLETED, FAILED
    filename: str
    transcript: Optional[str] = None
    analysis: Optional[MeetingAnalysis] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
