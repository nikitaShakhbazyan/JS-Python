from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models
from ..database import get_db 
from ..security import get_current_user

router = APIRouter(
    prefix="/participants",
    tags=["Participants"],
)

@router.post(
    "/", 
    response_model=schemas.Participant, 
    status_code=status.HTTP_201_CREATED
)
def create_participant(
    participant: schemas.ParticipantCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    """creating new user."""
    
    existing_participant = db.query(models.Participant).filter(
        models.Participant.subject_id == participant.subject_id
    ).first()
    
    if existing_participant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Participant with subject_id '{participant.subject_id}' already exists."
        )
    db_participant = models.Participant(**participant.model_dump())
    
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    
    return db_participant


@router.get("/", response_model=List[schemas.Participant])
def read_participants(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    """returns all part. list."""
    participants = db.query(models.Participant).all()
    return participants


@router.get("/{participant_id}", response_model=schemas.Participant)
def read_participant(
    participant_id: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """return choosen part. list"""
    participant = db.query(models.Participant).filter(
        models.Participant.participant_id == participant_id
    ).first()
    
    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Participant not found"
        )
    return participant