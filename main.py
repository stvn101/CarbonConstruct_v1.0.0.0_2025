"""
CarbonConstruct API - NGER & NCC 2025 Compliant Carbon Calculator
FastAPI backend for construction carbon emissions calculation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
from pathlib import Path

from .routes import calculator, projects, reports
from ..core.database import init_database, load_nger_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    print("🔧 Initializing CarbonConstruct database...")
    init_database()
    load_nger_data()
    print("✅ Database ready")
    yield
    print("🔴 Shutting down")


app = FastAPI(
    title="CarbonConstruct API",
    description="Australia's first NGER & NCC 2025 compliant construction carbon calculator",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS for Vite dev server (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",
        "https://carbonconstruct.com.au",
        "https://www.carbonconstruct.xyz"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
def health_check():
    """API health status"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "compliance": ["NGER Act 2007", "NCC 2025"]
    }

# Mount routers
app.include_router(calculator.router, prefix="/api/v1/calculate", tags=["Calculator"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
