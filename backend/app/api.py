from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import participants, auth
from .database import engine
from . import models
import time
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Clinical Trial Data API",
    description="Python API for managing trial participants and metrics.",
    version="v1"
)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup with retry logic"""
    max_retries = 5
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            models.Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"Database connection failed (attempt {attempt + 1}/{max_retries}), retrying in {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts: {e}")
                raise

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(participants.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API is running"}