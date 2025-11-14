# Clinical Trial Data API - Backend

Python/FastAPI backend for managing clinical trial participants.

## Features

-  RESTful API with FastAPI
-  JWT Authentication
-  PostgreSQL Database
-  Comprehensive Testing (pytest)
-  Structured Logging
-  Docker Support
-  CI/CD Ready

## Setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Running with Docker

```bash
docker-compose up --build
```

### Running Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export SECRET_KEY="your-secret-key"
export DATABASE_URL="postgresql://user:password@localhost:5432/trial_db"

# Run the server
uvicorn app.api:app --reload
```

## Testing

### Run all tests

```bash
cd backend
pytest
```

### Run with coverage

```bash
pytest --cov=app --cov-report=html
```

### Run specific test file

```bash
pytest tests/test_auth.py -v
```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /token` - Login and get JWT token

### Participants
- `GET /participants/` - List all participants (Auth required)
- `POST /participants/` - Create participant (Auth required)
- `GET /participants/{id}` - Get participant by ID (Auth required)
- `DELETE /participants/{id}` - Delete participant (Auth required)

### Health
- `GET /` - Basic health check
- `GET /health` - Detailed health check with DB status

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
