"""
CarbonConstruct Calculator Engine
NGER Act 2007 & NCC 2025 compliant carbon emissions calculator
"""

from typing import Dict, Optional, Literal
from datetime import datetime
import sqlite3
import json
from pathlib import Path

from .database import get_db_connection


class CarbonCalculator:
    """
    NGER & NCC 2025 compliant carbon calculator engine
    
    Key Features:
    - Diesel stationary vs transport disambiguation (171% N₂O difference)
    - State-specific electricity factors (SA: 0.21 vs VIC: 0.77 kgCO₂e/kWh)
    - Timber waste DOC method (1.5 t CO₂e/t vs generic 0.2 t)
    - Biogenic carbon storage tracking
    - Full audit trail for regulatory compliance
    """
    
    def __init__(self):
        self.db = get_db_connection()
    
    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()
    
    def calculate_fuel_emissions(
        self,
        project_id: str,
        fuel_type: str,
        quantity: float,
        unit: str,
        state: str,
        is_stationary: bool,
        year: int = 2024
    ) -> Dict:
        """
        Calculate Scope 1 emissions from fuel combustion
        
        CRITICAL: Diesel MUST distinguish stationary vs transport
        - N₂O factor differs by 171% between stationary and transport
        - This is a regulatory compliance requirement
        
        Args:
            project_id: Project identifier
            fuel_type: e.g., "Diesel", "Petrol", "Natural Gas"
            quantity: Amount consumed
            unit: e.g., "L", "kL", "GJ"
            state: Australian state code (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
            is_stationary: True for stationary combustion, False for transport
            year: Factor vintage year
        
        Returns:
            Dict with co2e_kg, breakdown by gas, factor_source, uncertainty
        
        Raises:
            ValueError: If fuel/state combination not found or validation fails
        """
        
        # VALIDATION: Diesel disambiguation
        if fuel_type.lower() == "diesel" and is_stationary is None:
            raise ValueError(
                "⚠️  Diesel fuel requires is_stationary flag. "
                "N₂O emission factors differ by 171% between stationary and transport use. "
                "Ask user: 'Is this diesel used in a registered road vehicle?'"
            )
        
        category = "Stationary" if is_stationary else "Transport"
        
        # Fetch NGER factor from database
        cursor = self.db.cursor()
        factor = cursor.execute("""
            SELECT * FROM nger_operational_factors
            WHERE scope = 1
              AND category = ?
              AND fuel_type = ?
              AND region = ?
        """, (category, fuel_type, state)).fetchone()
        
        if not factor:
            raise ValueError(
                f"No NGER factor found for {fuel_type} ({category}) in {state}. "
                f"Available states: NSW, VIC, QLD, SA, WA, TAS, NT, ACT"
            )
        
        # Calculate emissions
        co2_kg = quantity * (factor['co2_factor'] or 0)
        ch4_kg = quantity * (factor['ch4_factor'] or 0)
        n2o_kg = quantity * (factor['n2o_factor'] or 0)
        co2e_kg = quantity * factor['total_co2e']
        
        # Energy content (for reporting)
        energy_gj = quantity * (factor['ec_gj_per_unit'] or 0)
        
        # Construct factor source citation
        factor_source = (
            f"NGER {year}, Table 1, {factor['fuel_type']} ({category}), "
            f"{factor['region']}, Method: {factor['nger_method']}"
        )
        
        # Audit log
        self._log_calculation(
            project_id=project_id,
            activity_type="fuel",
            item_description=f"{fuel_type} ({category})",
            quantity=quantity,
            unit=unit,
            factor_used=factor['total_co2e'],
            factor_source=factor_source,
            result_kg_co2e=co2e_kg,
            uncertainty_pct=5.0,  # Tier 1 data
            metadata={
                "co2_kg": co2_kg,
                "ch4_kg": ch4_kg,
                "n2o_kg": n2o_kg,
                "energy_gj": energy_gj
            }
        )
        
        return {
            "co2e_kg": round(co2e_kg, 2),
            "breakdown": {
                "co2_kg": round(co2_kg, 2),
                "ch4_kg": round(ch4_kg, 6),
                "n2o_kg": round(n2o_kg, 6)
            },
            "energy_gj": round(energy_gj, 2),
            "factor_source": factor_source,
            "uncertainty_pct": 5.0,
            "compliance": "NGER Act 2007, Method 1"
        }
    
    def calculate_material_emissions(
        self,
        project_id: str,
        material_type: str,
        quantity: float,
        unit: str,
        data_quality: Literal["default", "avg", "min", "max"] = "default"
    ) -> Dict:
        """
        Calculate A1-A3 embodied carbon from materials
        
        Includes biogenic carbon storage for timber (negative emissions)
        
        Args:
            project_id: Project identifier
            material_type: e.g., "Concrete - 32 MPa", "Structural timber - Hardwood"
            quantity: Amount used
            unit: e.g., "m3", "t", "m2"
            data_quality: Factor selection (default/avg/min/max)
        
        Returns:
            Dict with co2e_kg, carbon_storage_kg, net_co2e_kg, uncertainty
        """
        cursor = self.db.cursor()
        factor = cursor.execute("""
            SELECT * FROM nger_materials
            WHERE material_type = ?
        """, (material_type,)).fetchone()
        
        if not factor:
            raise ValueError(
                f"Material '{material_type}' not found in database. "
                f"Use /api/v1/materials endpoint to list available materials."
            )
        
        # Select factor based on data quality tier
        if data_quality == "max":
            ec_per_unit = factor['a1a3_max_per_unit'] or factor['a1a3_default_per_unit']
        elif data_quality == "min":
            ec_per_unit = factor['a1a3_min_per_unit'] or factor['a1a3_default_per_unit']
        elif data_quality == "avg":
            ec_per_unit = factor['a1a3_avg_per_unit'] or factor['a1a3_default_per_unit']
        else:
            ec_per_unit = factor['a1a3_default_per_unit']
        
        # Calculate gross emissions (A1-A3)
        co2e_kg = quantity * ec_per_unit
        
        # Biogenic carbon storage (negative for timber)
        storage_kg = quantity * (factor['carbon_storage_per_unit'] or 0)
        
        # Net emissions
        net_co2e_kg = co2e_kg + storage_kg  # storage_kg is negative
        
        factor_source = (
            f"NGER Materials Database v2025.1, {material_type}, "
            f"Data Quality: {factor['data_quality']}, "
            f"Factor: {data_quality}"
        )
        
        self._log_calculation(
            project_id=project_id,
            activity_type="material",
            item_description=material_type,
            quantity=quantity,
            unit=unit,
            factor_used=ec_per_unit,
            factor_source=factor_source,
            result_kg_co2e=net_co2e_kg,
            uncertainty_pct=factor['uncertainty_pct'],
            metadata={
                "gross_co2e_kg": co2e_kg,
                "carbon_storage_kg": storage_kg,
                "data_quality_tier": factor['data_quality']
            }
        )
        
        return {
            "gross_co2e_kg": round(co2e_kg, 2),
            "carbon_storage_kg": round(storage_kg, 2),
            "net_co2e_kg": round(net_co2e_kg, 2),
            "factor_source": factor_source,
            "uncertainty_pct": factor['uncertainty_pct'],
            "data_quality": factor['data_quality'],
            "compliance": "NCC 2025 Whole-of-Life Assessment, A1-A3"
        }
    
    def calculate_waste_emissions(
        self,
        project_id: str,
        waste_type: str,
        quantity: float,
        unit: str = "t"
    ) -> Dict:
        """
        Calculate Scope 3 emissions from waste disposal
        
        CRITICAL: Timber waste uses DOC method (1.5 t CO₂e/t)
        NOT generic organic waste factor (0.2 t CO₂e/t)
        
        Args:
            project_id: Project identifier
            waste_type: e.g., "Timber waste", "Concrete waste", "Steel waste"
            quantity: Amount in tonnes
            unit: Should be "t" (tonnes)
        
        Returns:
            Dict with co2e_kg, factor_source, method
        """
        
        # NGER Waste disposal factors
        # Timber/wood uses Degradable Organic Carbon (DOC) method
        if any(kw in waste_type.lower() for kw in ["timber", "wood", "lumber"]):
            doc_factor = 1.5  # t CO₂e per tonne
            method = "NGER Waste Method 2, DOC factor for timber/wood"
            uncertainty = 15.0
        elif "concrete" in waste_type.lower():
            doc_factor = 0.05  # Minimal emissions from inert waste
            method = "NGER Waste Method 1, Inert waste"
            uncertainty = 10.0
        elif "steel" in waste_type.lower() or "metal" in waste_type.lower():
            doc_factor = 0.1  # Processing emissions
            method = "NGER Waste Method 1, Metal waste"
            uncertainty = 10.0
        else:
            doc_factor = 0.2  # Generic organic waste
            method = "NGER Waste Method 1, Generic organic"
            uncertainty = 20.0
        
        # Convert tonnes to kg CO₂e
        co2e_kg = quantity * 1000 * doc_factor
        
        self._log_calculation(
            project_id=project_id,
            activity_type="waste",
            item_description=waste_type,
            quantity=quantity,
            unit=unit,
            factor_used=doc_factor,
            factor_source=method,
            result_kg_co2e=co2e_kg,
            uncertainty_pct=uncertainty,
            metadata={"method": method}
        )
        
        return {
            "co2e_kg": round(co2e_kg, 2),
            "factor_source": method,
            "factor_t_co2e_per_t": doc_factor,
            "uncertainty_pct": uncertainty,
            "compliance": "NGER Act 2007, Waste Disposal"
        }
    
    def _log_calculation(self, **kwargs):
        """
        Audit trail for NGER compliance
        
        Every calculation MUST be logged with:
        - What was calculated
        - Which factor was used
        - Where the factor came from
        - When the calculation was performed
        """
        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO calculation_log (
                project_id, activity_type, item_description,
                quantity, unit, factor_used, factor_source,
                result_kg_co2e, uncertainty_pct, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            kwargs['project_id'],
            kwargs['activity_type'],
            kwargs['item_description'],
            kwargs['quantity'],
            kwargs['unit'],
            kwargs['factor_used'],
            kwargs['factor_source'],
            kwargs['result_kg_co2e'],
            kwargs.get('uncertainty_pct'),
            json.dumps(kwargs.get('metadata', {}))
        ))
        self.db.commit()
    
    def get_project_summary(self, project_id: str) -> Dict:
        """
        Generate project carbon summary for NCC WoL reporting
        
        Returns:
            Breakdown by activity type (fuel, material, waste, transport)
            with total emissions and uncertainty
        """
        cursor = self.db.cursor()
        
        # Get breakdown by activity type
        breakdown = cursor.execute("""
            SELECT 
                activity_type,
                COUNT(*) as count,
                SUM(result_kg_co2e) as total_co2e,
                AVG(uncertainty_pct) as avg_uncertainty
            FROM calculation_log
            WHERE project_id = ?
            GROUP BY activity_type
        """, (project_id,)).fetchall()
        
        # Get recent calculations
        recent = cursor.execute("""
            SELECT * FROM calculation_log
            WHERE project_id = ?
            ORDER BY timestamp DESC
            LIMIT 10
        """, (project_id,)).fetchall()
        
        total_co2e = sum(row['total_co2e'] for row in breakdown)
        
        return {
            "project_id": project_id,
            "total_co2e_kg": round(total_co2e, 2),
            "total_co2e_tonnes": round(total_co2e / 1000, 2),
            "breakdown": {
                row['activity_type']: {
                    "count": row['count'],
                    "co2e_kg": round(row['total_co2e'], 2),
                    "uncertainty_pct": round(row['avg_uncertainty'], 1) if row['avg_uncertainty'] else None
                }
                for row in breakdown
            },
            "recent_calculations": [
                {
                    "timestamp": row['timestamp'],
                    "activity": row['activity_type'],
                    "description": row['item_description'],
                    "co2e_kg": round(row['result_kg_co2e'], 2)
                }
                for row in recent
            ],
            "timestamp": datetime.now().isoformat(),
            "compliance": "NCC 2025 Whole-of-Life Assessment"
        }
    
    def get_audit_log(self, project_id: str) -> list:
        """
        Get full audit trail for regulatory reporting
        
        Returns complete calculation history with factor sources
        """
        cursor = self.db.cursor()
        logs = cursor.execute("""
            SELECT * FROM calculation_log
            WHERE project_id = ?
            ORDER BY timestamp DESC
        """, (project_id,)).fetchall()
        
        return [dict(log) for log in logs]
