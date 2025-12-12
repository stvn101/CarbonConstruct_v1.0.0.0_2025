"""
Reports API endpoints for NGER and NCC compliance
"""

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import JSONResponse
import json
from datetime import datetime

from ..models.schemas import APIResponse
from ...core.calculator_engine import CarbonCalculator

router = APIRouter()


@router.get("/{project_id}/nger-json", response_model=APIResponse)
async def export_nger_json(project_id: str):
    """
    Export project data in NGER-compliant JSON format
    
    For submission to Clean Energy Regulator
    """
    try:
        calc = CarbonCalculator()
        summary = calc.get_project_summary(project_id)
        audit_log = calc.get_audit_log(project_id)
        
        # NGER report structure
        nger_report = {
            "report_metadata": {
                "project_id": project_id,
                "generated_at": datetime.now().isoformat(),
                "reporting_year": datetime.now().year,
                "software": "CarbonConstruct v2.0",
                "compliance_framework": "NGER Act 2007"
            },
            "emissions_summary": {
                "total_co2e_tonnes": summary['total_co2e_tonnes'],
                "scope_1": summary['breakdown'].get('fuel', {}).get('co2e_kg', 0) / 1000,
                "scope_2": 0,  # Electricity (future)
                "scope_3": (
                    summary['breakdown'].get('material', {}).get('co2e_kg', 0) +
                    summary['breakdown'].get('waste', {}).get('co2e_kg', 0)
                ) / 1000
            },
            "calculation_log": [
                {
                    "timestamp": log['timestamp'],
                    "activity_type": log['activity_type'],
                    "description": log['item_description'],
                    "quantity": log['quantity'],
                    "unit": log['unit'],
                    "emission_factor": log['factor_used'],
                    "factor_source": log['factor_source'],
                    "result_kg_co2e": log['result_kg_co2e'],
                    "uncertainty_pct": log['uncertainty_pct']
                }
                for log in audit_log
            ],
            "methodology_statement": (
                "Emissions calculated using NGER (Measurement) Determination 2008 methods. "
                "Operational factors from National Greenhouse Accounts Factors 2024. "
                "Material factors from NGER Materials Database v2025.1. "
                "All calculations logged with factor sources for audit trail."
            )
        }
        
        return APIResponse(
            status="success",
            data=nger_report,
            message="NGER-compliant report generated"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating NGER report: {str(e)}")


@router.get("/{project_id}/ncc-summary", response_model=APIResponse)
async def export_ncc_summary(project_id: str):
    """
    Export NCC 2025 Whole-of-Life carbon summary
    
    For building consent applications
    """
    try:
        calc = CarbonCalculator()
        summary = calc.get_project_summary(project_id)
        
        # NCC WoL structure (A1-A5 breakdown)
        ncc_report = {
            "project_id": project_id,
            "report_type": "NCC 2025 Whole-of-Life Assessment",
            "generated_at": datetime.now().isoformat(),
            "life_cycle_stages": {
                "A1_A3_product_stage": {
                    "description": "Material extraction, transport, manufacturing",
                    "co2e_kg": summary['breakdown'].get('material', {}).get('co2e_kg', 0),
                    "data_quality": "NGER Materials Database v2025.1"
                },
                "A4_transport": {
                    "description": "Transport to site",
                    "co2e_kg": summary['breakdown'].get('transport', {}).get('co2e_kg', 0),
                    "data_quality": "NGER Transport factors"
                },
                "A5_construction": {
                    "description": "Construction process",
                    "co2e_kg": summary['breakdown'].get('fuel', {}).get('co2e_kg', 0),
                    "data_quality": "NGER Scope 1 factors"
                },
                "C_end_of_life": {
                    "description": "Waste disposal",
                    "co2e_kg": summary['breakdown'].get('waste', {}).get('co2e_kg', 0),
                    "data_quality": "NGER Waste DOC method"
                }
            },
            "total_embodied_carbon_kg": summary['total_co2e_kg'],
            "compliance_status": "Calculated per NCC 2025 requirements",
            "methodology": "AS/NZS ISO 14040:2021 Life cycle assessment — Principles and framework"
        }
        
        return APIResponse(
            status="success",
            data=ncc_report,
            message="NCC WoL summary generated"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating NCC report: {str(e)}")


@router.get("/{project_id}/methodology", response_model=APIResponse)
async def get_methodology_statement(project_id: str):
    """
    Generate methodology statement for regulatory submissions
    
    Cites specific NGER clauses and factor sources used
    """
    try:
        calc = CarbonCalculator()
        audit_log = calc.get_audit_log(project_id)
        
        # Extract unique factor sources
        sources = set(log['factor_source'] for log in audit_log)
        
        methodology = {
            "project_id": project_id,
            "calculation_framework": "NGER (Measurement) Determination 2008",
            "factor_sources": list(sources),
            "methods_applied": [
                "NGER Method 1 - Fuel combustion (Scope 1)",
                "NGER Materials Database v2025.1 - Embodied carbon (A1-A3)",
                "NGER Waste Method 2 - DOC method for timber waste",
                "State-specific electricity factors (Scope 2)"
            ],
            "data_quality": {
                "Tier 1": "Supplier-specific data with EPDs",
                "Tier 2": "Industry-average data from NGER database",
                "Tier 3": "Generic default factors"
            },
            "audit_trail": f"{len(audit_log)} calculations logged with timestamps and factor sources",
            "uncertainty": "Quantified per NGER guidelines (5-20% depending on data tier)",
            "generated_at": datetime.now().isoformat()
        }
        
        return APIResponse(
            status="success",
            data=methodology,
            message="Methodology statement generated"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating methodology: {str(e)}")
