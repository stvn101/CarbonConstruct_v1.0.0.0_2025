"""
Pydantic models for API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Literal, Dict, Any
from datetime import datetime


# ============= REQUEST MODELS =============

class FuelCalculationRequest(BaseModel):
    """Request model for fuel emission calculation"""
    project_id: str = Field(..., description="Project identifier")
    fuel_type: str = Field(..., description="Fuel type (e.g., Diesel, Petrol, Natural Gas)")
    quantity: float = Field(..., gt=0, description="Quantity consumed")
    unit: str = Field(..., description="Unit of measurement (L, kL, GJ)")
    state: str = Field(..., description="Australian state code (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)")
    is_stationary: bool = Field(..., description="True = stationary combustion, False = transport")
    
    @validator('state')
    def validate_state(cls, v):
        valid_states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
        if v.upper() not in valid_states:
            raise ValueError(f'State must be one of: {", ".join(valid_states)}')
        return v.upper()
    
    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "PRJ001",
                "fuel_type": "Diesel",
                "quantity": 5000,
                "unit": "L",
                "state": "NSW",
                "is_stationary": False
            }
        }


class MaterialCalculationRequest(BaseModel):
    """Request model for material embodied carbon calculation"""
    project_id: str = Field(..., description="Project identifier")
    material_type: str = Field(..., description="Material type (use /materials endpoint for list)")
    quantity: float = Field(..., gt=0, description="Quantity used")
    unit: str = Field(..., description="Unit of measurement (m3, t, m2)")
    data_quality: Literal["default", "avg", "min", "max"] = Field(
        default="default",
        description="Factor selection tier (default, avg, min, max)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "PRJ001",
                "material_type": "Concrete - 32 MPa",
                "quantity": 100,
                "unit": "m3",
                "data_quality": "default"
            }
        }


class WasteCalculationRequest(BaseModel):
    """Request model for waste disposal emissions"""
    project_id: str = Field(..., description="Project identifier")
    waste_type: str = Field(..., description="Type of waste (Timber, Concrete, Steel, etc.)")
    quantity: float = Field(..., gt=0, description="Quantity in tonnes")
    unit: str = Field(default="t", description="Unit (should be tonnes)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "PRJ001",
                "waste_type": "Timber waste",
                "quantity": 2.5,
                "unit": "t"
            }
        }


class ProjectCreateRequest(BaseModel):
    """Request model for creating a new project"""
    project_id: str = Field(..., description="Unique project identifier")
    project_name: str = Field(..., description="Project name")
    postcode: Optional[int] = Field(None, description="Australian postcode")
    state: Optional[str] = Field(None, description="Australian state")
    ncc_volume: Optional[str] = Field(None, description="NCC volume (1 or 2)")


# ============= RESPONSE MODELS =============

class EmissionBreakdown(BaseModel):
    """Breakdown of emissions by gas type"""
    co2_kg: float
    ch4_kg: float
    n2o_kg: float


class FuelCalculationResponse(BaseModel):
    """Response model for fuel calculation"""
    co2e_kg: float
    breakdown: EmissionBreakdown
    energy_gj: float
    factor_source: str
    uncertainty_pct: float
    compliance: str


class MaterialCalculationResponse(BaseModel):
    """Response model for material calculation"""
    gross_co2e_kg: float
    carbon_storage_kg: float
    net_co2e_kg: float
    factor_source: str
    uncertainty_pct: Optional[float]
    data_quality: str
    compliance: str


class WasteCalculationResponse(BaseModel):
    """Response model for waste calculation"""
    co2e_kg: float
    factor_source: str
    factor_t_co2e_per_t: float
    uncertainty_pct: float
    compliance: str


class ActivityBreakdown(BaseModel):
    """Breakdown of emissions by activity type"""
    count: int
    co2e_kg: float
    uncertainty_pct: Optional[float]


class RecentCalculation(BaseModel):
    """Recent calculation summary"""
    timestamp: str
    activity: str
    description: str
    co2e_kg: float


class ProjectSummaryResponse(BaseModel):
    """Project emissions summary"""
    project_id: str
    total_co2e_kg: float
    total_co2e_tonnes: float
    breakdown: Dict[str, ActivityBreakdown]
    recent_calculations: list[RecentCalculation]
    timestamp: str
    compliance: str


class APIResponse(BaseModel):
    """Generic API response wrapper"""
    status: Literal["success", "error"]
    data: Optional[Any] = None
    message: Optional[str] = None
    errors: Optional[list[str]] = None


class MaterialInfo(BaseModel):
    """Material information for listing"""
    material_type: str
    material_category: str
    unit: str
    a1a3_default_per_unit: float
    data_quality: str
    carbon_storage_per_unit: Optional[float] = 0


class FuelInfo(BaseModel):
    """Fuel information for listing"""
    fuel_type: str
    category: str
    region: str
    unit: str
    total_co2e: float
    nger_method: str
