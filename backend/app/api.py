from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .routers import participants, auth
from .database import engine
from . import models
import time
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

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
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with logging"""
    logger.warning(
        f"HTTP {exc.status_code} - {request.method} {request.url.path} - {exc.detail}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed logging"""
    logger.error(
        f"Validation error - {request.method} {request.url.path} - {exc.errors()}"
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(
        f"Unexpected error - {request.method} {request.url.path} - {str(exc)}",
        exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and responses"""
    start_time = time.time()

    logger.info(f"Incoming request: {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(
        f"Request completed: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - Duration: {process_time:.3f}s"
    )

    response.headers["X-Process-Time"] = str(process_time)
    return response


app.include_router(auth.router)
app.include_router(participants.router)

@app.get("/")
def read_root():
    """Root endpoint - health check"""
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "message": "API is running"}


@app.get("/health")
def health_check():
    """Detailed health check endpoint"""
    try:
        # Test database connection
        from sqlalchemy import text
        from .database import engine
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("Health check passed")
        return {
            "status": "healthy",
            "database": "connected",
            "version": "v1"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )