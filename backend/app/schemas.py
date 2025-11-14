from pydantic import BaseModel, Field
from datetime import date
from typing import Literal
import uuid


class ParticipantCreate(BaseModel):
    """Schema for creating a new participant"""
    subject_id: str = Field(..., max_length=10, example="P007")
    study_group: Literal["treatment", "control"] = Field(..., example="treatment")
    enrollment_date: date = Field(default_factory=date.today)
    status: Literal["active", "completed", "withdrawn"] = Field(default="active")
    age: int = Field(..., gt=0, le=120, example=45)
    gender: Literal["M", "F", "Other"] = Field(..., example="F")


class Participant(ParticipantCreate):
    """API response """
    participant_id: uuid.UUID
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    """new user registration"""
    email: str
    password: str

class Token(BaseModel):
    """schema for returning a token."""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """schema for data inside JWT."""
    email: str | None = None