"""
Calculator API endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import List

from ..models.schemas import (
    FuelCalculationRequest, FuelCalculationResponse,
    MaterialCalculationRequest, MaterialCalculationResponse,
    WasteCalculationRequest, WasteCalculationResponse,
    APIResponse, MaterialInfo, FuelInfo
)
from ...core.calculator_engine import CarbonCalculator
from ...core.database import get_db_connection

router = APIRouter()


@router.post("/fuel", response_model=APIResponse)
async def calculate_fuel(request: FuelCalculationRequest):
    """
    Calculate Scope 1 emissions from fuel combustion
    
    **Critical**: Diesel requires `is_stationary` flag
    - N₂O factors differ by 171% between stationary and transport
    - UI must ask: "Is this fuel used in a registered road vehicle?"
    
    **State-specific factors**: 
    - Electricity and gas factors vary significantly by state
    - Always provide accurate state code
    """
    try:
        calc = CarbonCalculator()
        result = calc.calculate_fuel_emissions(
            project_id=request.project_id,
            fuel_type=request.fuel_type,
            quantity=request.quantity,
            unit=request.unit,
            state=request.state,
            is_stationary=request.is_stationary
        )
        return APIResponse(status="success", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@router.post("/material", response_model=APIResponse)
async def calculate_material(request: MaterialCalculationRequest):
    """
    Calculate A1-A3 embodied carbon from materials
    
    **Data Quality Tiers**:
    - `default`: NGER standard factor (Tier 3)
    - `avg`: Average of available EPDs (Tier 2)
    - `min`: Conservative lower bound (Tier 1)
    - `max`: Conservative upper bound (Tier 1)
    
    **Biogenic Carbon**:
    - Timber includes carbon storage (negative emissions)
    - Net emissions = Gross emissions + Storage (storage is negative)
    """
    try:
        calc = CarbonCalculator()
        result = calc.calculate_material_emissions(
            project_id=request.project_id,
            material_type=request.material_type,
            quantity=request.quantity,
            unit=request.unit,
            data_quality=request.data_quality
        )
        return APIResponse(status="success", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@router.post("/waste", response_model=APIResponse)
async def calculate_waste(request: WasteCalculationRequest):
    """
    Calculate Scope 3 emissions from waste disposal
    
    **Critical**: Timber waste uses DOC method
    - Timber/wood: 1.5 t CO₂e per tonne
    - Concrete: 0.05 t CO₂e per tonne (inert)
    - Steel: 0.1 t CO₂e per tonne
    - Generic organic: 0.2 t CO₂e per tonne
    """
    try:
        calc = CarbonCalculator()
        result = calc.calculate_waste_emissions(
            project_id=request.project_id,
            waste_type=request.waste_type,
            quantity=request.quantity,
            unit=request.unit
        )
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@router.get("/materials", response_model=APIResponse)
async def list_materials(
    category: str = None,
    search: str = None
):
    """
    List available materials with emission factors
    
    Query Parameters:
    - `category`: Filter by material category (e.g., "Concrete", "Steel", "Timber")
    - `search`: Search in material type name
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        query = "SELECT * FROM nger_materials WHERE 1=1"
        params = []
        
        if category:
            query += " AND material_category = ?"
            params.append(category)
        
        if search:
            query += " AND material_type LIKE ?"
            params.append(f"%{search}%")
        
        query += " ORDER BY material_category, material_type"
        
        materials = cursor.execute(query, params).fetchall()
        db.close()
        
        return APIResponse(
            status="success",
            data=[
                {
                    "material_type": m['material_type'],
                    "material_category": m['material_category'],
                    "unit": m['unit'],
                    "a1a3_default_per_unit": m['a1a3_default_per_unit'],
                    "data_quality": m['data_quality'],
                    "carbon_storage_per_unit": m['carbon_storage_per_unit']
                }
                for m in materials
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/fuels", response_model=APIResponse)
async def list_fuels(
    state: str = None,
    category: str = None
):
    """
    List available fuels with emission factors
    
    Query Parameters:
    - `state`: Filter by state (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
    - `category`: Filter by category (Stationary, Transport)
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        query = "SELECT * FROM nger_operational_factors WHERE scope = 1"
        params = []
        
        if state:
            query += " AND region = ?"
            params.append(state.upper())
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        query += " ORDER BY category, fuel_type, region"
        
        fuels = cursor.execute(query, params).fetchall()
        db.close()
        
        return APIResponse(
            status="success",
            data=[
                {
                    "fuel_type": f['fuel_type'],
                    "category": f['category'],
                    "region": f['region'],
                    "unit": f['unit'],
                    "total_co2e": f['total_co2e'],
                    "nger_method": f['nger_method']
                }
                for f in fuels
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/categories", response_model=APIResponse)
async def list_categories():
    """
    List all material categories for filtering
    """
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        categories = cursor.execute("""
            SELECT DISTINCT material_category 
            FROM nger_materials 
            ORDER BY material_category
        """).fetchall()
        
        db.close()
        
        return APIResponse(
            status="success",
            data=[c['material_category'] for c in categories]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
