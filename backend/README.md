# Backend Services

This directory contains backend service implementations for CarbonConstruct.

## Starlette PoC

### starlette_poc.py

A proof-of-concept Starlette application demonstrating form handling with a POST endpoint.

**Features:**
- Single POST route at `/`
- Async form handling
- Minimal implementation for testing purposes

**Running the application:**

```bash
# Install dependencies
pip install -r ../requirements.txt

# Run with uvicorn
uvicorn starlette_poc:app --reload
```

**Testing:**

```bash
# Run tests
pytest test_starlette_poc.py
```

**Usage Example:**

```bash
# Test the endpoint
curl -X POST http://localhost:8000/ -F "key=value"
```

## Purpose

This PoC demonstrates Starlette's async form handling capabilities and serves as a foundation for future backend services that may require standalone ASGI applications.
