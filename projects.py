"""
Projects API endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

from ..models.schemas import (
    ProjectCreateRequest, ProjectSummaryResponse, APIResponse
)
from ...core.calculator_engine import CarbonCalculator
from ...core.database import get_db_connection

router = APIRouter()


@router.post("", response_model=APIResponse)
async def create_project(request: ProjectCreateRequest):
    """
    Create a new project for carbon tracking
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # Check if project exists
        existing = cursor.execute(
            "SELECT project_id FROM projects WHERE project_id = ?",
            (request.project_id,)
        ).fetchone()
        
        if existing:
            db.close()
            raise HTTPException(status_code=400, detail=f"Project {request.project_id} already exists")
        
        # Create project
        cursor.execute("""
            INSERT INTO projects (project_id, project_name, postcode, state, ncc_volume)
            VALUES (?, ?, ?, ?, ?)
        """, (
            request.project_id,
            request.project_name,
            request.postcode,
            request.state,
            request.ncc_volume
        ))
        
        db.commit()
        db.close()
        
        return APIResponse(
            status="success",
            data={"project_id": request.project_id, "project_name": request.project_name},
            message="Project created successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{project_id}", response_model=APIResponse)
async def get_project(project_id: str):
    """
    Get project details
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        project = cursor.execute(
            "SELECT * FROM projects WHERE project_id = ?",
            (project_id,)
        ).fetchone()
        
        db.close()
        
        if not project:
            raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
        
        return APIResponse(status="success", data=dict(project))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{project_id}/summary", response_model=APIResponse)
async def get_project_summary(project_id: str):
    """
    Get project carbon emissions summary
    
    Returns breakdown by activity type (fuel, material, waste, transport)
    with total emissions and recent calculations
    """
    try:
        calc = CarbonCalculator()
        summary = calc.get_project_summary(project_id)
        return APIResponse(status="success", data=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


@router.get("/{project_id}/audit", response_model=APIResponse)
async def get_audit_log(project_id: str):
    """
    Get full audit trail for regulatory reporting
    
    Returns complete calculation history with:
    - Factor sources
    - Timestamps
    - Uncertainty estimates
    - Methodology citations
    """
    try:
        calc = CarbonCalculator()
        audit_log = calc.get_audit_log(project_id)
        return APIResponse(
            status="success",
            data=audit_log,
            message=f"Retrieved {len(audit_log)} calculation records"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving audit log: {str(e)}")


@router.get("", response_model=APIResponse)
async def list_projects(
    state: Optional[str] = None,
    ncc_volume: Optional[str] = None
):
    """
    List all projects with optional filtering
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        query = "SELECT * FROM projects WHERE 1=1"
        params = []
        
        if state:
            query += " AND state = ?"
            params.append(state)
        
        if ncc_volume:
            query += " AND ncc_volume = ?"
            params.append(ncc_volume)
        
        query += " ORDER BY created_at DESC"
        
        projects = cursor.execute(query, params).fetchall()
        db.close()
        
        return APIResponse(
            status="success",
            data=[dict(p) for p in projects]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
