from sqlalchemy import Column, String, Integer, Date, Enum
from sqlalchemy.ext.declarative import declarative_base
import uuid
import datetime

Base = declarative_base()

class Participant(Base):
    """
    Model for clinical trial participants
    """
    __tablename__ = "participants"

    # main unique identifier for each participant
    participant_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # subject ID assigned to participant
    subject_id = Column(String, unique=True, nullable=False)
    
    # a group of the study (e.g., control, treatment)
    study_group = Column(String, nullable=False) 
    
    # Data of users enrollment 
    enrollment_date = Column(Date, default=datetime.date.today)
    
    # status: active, completed, withdrawn
    status = Column(String, default="active") 
    
    # age
    age = Column(Integer, nullable=False)
    
    # male of female
    gender = Column(String, nullable=False)


class User(Base):
    """
    Model for user authentication
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)