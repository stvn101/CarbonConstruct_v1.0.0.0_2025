"""
Simple script to run the Starlette PoC application.

Usage:
    python run_poc.py

Then test with:
    curl -X POST http://localhost:8000/ -F "key=value"
"""
import uvicorn
from starlette_poc import app

if __name__ == "__main__":
    print("Starting Starlette PoC application...")
    print("Test the endpoint with:")
    print("  curl -X POST http://localhost:8000/ -F 'key=value'")
    uvicorn.run(app, host="127.0.0.1", port=8000)
