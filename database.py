"""
Database initialization and NGER data loading
"""

import sqlite3
import csv
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent.parent.parent / "carbonconstruct.db"
DATA_DIR = Path(__file__).parent.parent.parent / "data"


def get_db_connection() -> sqlite3.Connection:
    """Get database connection with Row factory"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize database schema"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # NGER Operational Factors (Scope 1/2/3)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nger_operational_factors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scope INTEGER NOT NULL,
            category TEXT NOT NULL,
            subcategory TEXT,
            fuel_type TEXT NOT NULL,
            region TEXT NOT NULL,
            unit TEXT NOT NULL,
            co2_factor REAL,
            ch4_factor REAL,
            n2o_factor REAL,
            total_co2e REAL NOT NULL,
            ec_gj_per_unit REAL,
            notes TEXT,
            nger_method TEXT,
            source TEXT,
            UNIQUE(scope, category, fuel_type, region)
        )
    """)
    
    # NGER Material Factors (A1-A3 Embodied)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nger_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            material_type TEXT NOT NULL,
            material_category TEXT NOT NULL,
            unit TEXT NOT NULL,
            data_quality TEXT,
            uncertainty_pct REAL,
            a1a3_default_per_unit REAL NOT NULL,
            a1a3_max_per_unit REAL,
            a1a3_min_per_unit REAL,
            a1a3_avg_per_unit REAL,
            a1a3_default_per_kg REAL,
            a1a3_max_per_kg REAL,
            a1a3_min_per_kg REAL,
            a1a3_avg_per_kg REAL,
            carbon_storage_per_unit REAL DEFAULT 0,
            carbon_storage_per_kg REAL DEFAULT 0,
            conversion_factor REAL,
            conversion_unit TEXT,
            UNIQUE(material_type, material_category)
        )
    """)
    
    # Projects
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            project_id TEXT PRIMARY KEY,
            project_name TEXT NOT NULL,
            postcode INTEGER,
            state TEXT,
            climate_zone INTEGER,
            ncc_volume TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Calculation Audit Log (CRITICAL for NGER compliance)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS calculation_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            activity_type TEXT NOT NULL,
            item_description TEXT,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            factor_used REAL NOT NULL,
            factor_source TEXT NOT NULL,
            result_kg_co2e REAL NOT NULL,
            uncertainty_pct REAL,
            metadata_json TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(project_id)
        )
    """)
    
    # Create indexes
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_nger_ops_lookup 
        ON nger_operational_factors(scope, category, fuel_type, region)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_nger_mat_lookup 
        ON nger_materials(material_type, material_category)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_calc_log_project 
        ON calculation_log(project_id, timestamp)
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database schema initialized")


def load_nger_data():
    """Load NGER operational factors and materials from CSV"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if data already loaded
    cursor.execute("SELECT COUNT(*) FROM nger_operational_factors")
    if cursor.fetchone()[0] > 0:
        print("⏭️  NGER data already loaded, skipping...")
        conn.close()
        return
    
    # Load operational factors
    ops_file = DATA_DIR / "nger_operational_factors_2024.csv"
    if ops_file.exists():
        with open(ops_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT INTO nger_operational_factors (
                        scope, category, subcategory, fuel_type, region, unit,
                        co2_factor, ch4_factor, n2o_factor, total_co2e,
                        ec_gj_per_unit, notes, nger_method, source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    int(row['scope']),
                    row['category'],
                    row.get('subcategory', ''),
                    row['fuel_type'],
                    row['region'],
                    row['unit'],
                    float(row['co2_factor']) if row['co2_factor'] else None,
                    float(row['ch4_factor']) if row['ch4_factor'] else None,
                    float(row['n2o_factor']) if row['n2o_factor'] else None,
                    float(row['total_co2e']),
                    float(row['ec_gj_per_unit']) if row['ec_gj_per_unit'] else None,
                    row.get('notes', ''),
                    row.get('nger_method', ''),
                    row.get('source', '')
                ))
        print(f"✅ Loaded {cursor.rowcount} NGER operational factors")
    
    # Load materials database
    mat_file = DATA_DIR / "nger_materials_database_v2025_1.csv"
    if mat_file.exists():
        with open(mat_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT INTO nger_materials (
                        material_type, material_category, unit, data_quality,
                        uncertainty_pct, a1a3_default_per_unit, a1a3_max_per_unit,
                        a1a3_min_per_unit, a1a3_avg_per_unit, a1a3_default_per_kg,
                        a1a3_max_per_kg, a1a3_min_per_kg, a1a3_avg_per_kg,
                        carbon_storage_per_unit, carbon_storage_per_kg,
                        conversion_factor, conversion_unit
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['material_type'],
                    row['material_category'],
                    row['unit'],
                    row.get('data_quality', 'Tier 3'),
                    float(row['uncertainty_pct']) if row['uncertainty_pct'] else None,
                    float(row['a1a3_default_per_unit']),
                    float(row['a1a3_max_per_unit']) if row['a1a3_max_per_unit'] else None,
                    float(row['a1a3_min_per_unit']) if row['a1a3_min_per_unit'] else None,
                    float(row['a1a3_avg_per_unit']) if row['a1a3_avg_per_unit'] else None,
                    float(row['a1a3_default_per_kg']) if row['a1a3_default_per_kg'] else None,
                    float(row['a1a3_max_per_kg']) if row['a1a3_max_per_kg'] else None,
                    float(row['a1a3_min_per_kg']) if row['a1a3_min_per_kg'] else None,
                    float(row['a1a3_avg_per_kg']) if row['a1a3_avg_per_kg'] else None,
                    float(row['carbon_storage_per_unit']) if row['carbon_storage_per_unit'] else 0,
                    float(row['carbon_storage_per_kg']) if row['carbon_storage_per_kg'] else 0,
                    float(row['conversion_factor']) if row['conversion_factor'] else None,
                    row.get('conversion_unit', '')
                ))
        print(f"✅ Loaded {cursor.rowcount} NGER material factors")
    
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_database()
    load_nger_data()
