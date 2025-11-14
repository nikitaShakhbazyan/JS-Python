from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import schemas, models, security
from ..database import get_db

router = APIRouter(
    tags=["Auth"],
)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    recieving username and pass, return Access Token
    """
    user = get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=schemas.Token)
def register_user(
    user_data: schemas.UserCreate, 
    db: Session = Depends(get_db)
):
    """
    New user registration
    """
    if get_user_by_email(db, email=user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = security.get_password_hash(user_data.password)
    db_user = models.User(email=user_data.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = security.create_access_token(data={"email": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}