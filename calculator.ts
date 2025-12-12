/**
 * CarbonConstruct API Client
 * TypeScript client for FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface FuelCalculationRequest {
  project_id: string;
  fuel_type: string;
  quantity: number;
  unit: string;
  state: string;
  is_stationary: boolean;
}

export interface MaterialCalculationRequest {
  project_id: string;
  material_type: string;
  quantity: number;
  unit: string;
  data_quality?: 'default' | 'avg' | 'min' | 'max';
}

export interface WasteCalculationRequest {
  project_id: string;
  waste_type: string;
  quantity: number;
  unit?: string;
}

export interface FuelCalculationResponse {
  co2e_kg: number;
  breakdown: {
    co2_kg: number;
    ch4_kg: number;
    n2o_kg: number;
  };
  energy_gj: number;
  factor_source: string;
  uncertainty_pct: number;
  compliance: string;
}

export interface MaterialCalculationResponse {
  gross_co2e_kg: number;
  carbon_storage_kg: number;
  net_co2e_kg: number;
  factor_source: string;
  uncertainty_pct: number;
  data_quality: string;
  compliance: string;
}

export interface WasteCalculationResponse {
  co2e_kg: number;
  factor_source: string;
  factor_t_co2e_per_t: number;
  uncertainty_pct: number;
  compliance: string;
}

export interface ProjectSummary {
  project_id: string;
  total_co2e_kg: number;
  total_co2e_tonnes: number;
  breakdown: {
    [key: string]: {
      count: number;
      co2e_kg: number;
      uncertainty_pct?: number;
    };
  };
  recent_calculations: Array<{
    timestamp: string;
    activity: string;
    description: string;
    co2e_kg: number;
  }>;
  timestamp: string;
  compliance: string;
}

export interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

export interface MaterialInfo {
  material_type: string;
  material_category: string;
  unit: string;
  a1a3_default_per_unit: number;
  data_quality: string;
  carbon_storage_per_unit?: number;
}

export interface FuelInfo {
  fuel_type: string;
  category: string;
  region: string;
  unit: string;
  total_co2e: number;
  nger_method: string;
}

class CarbonCalculatorAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // ========== CALCULATOR ENDPOINTS ==========

  async calculateFuel(data: FuelCalculationRequest): Promise<FuelCalculationResponse> {
    const response = await this.request<FuelCalculationResponse>(
      '/calculate/fuel',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async calculateMaterial(data: MaterialCalculationRequest): Promise<MaterialCalculationResponse> {
    const response = await this.request<MaterialCalculationResponse>(
      '/calculate/material',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async calculateWaste(data: WasteCalculationRequest): Promise<WasteCalculationResponse> {
    const response = await this.request<WasteCalculationResponse>(
      '/calculate/waste',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  }

  async listMaterials(category?: string, search?: string): Promise<MaterialInfo[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await this.request<MaterialInfo[]>(
      `/calculate/materials?${params.toString()}`
    );
    return response.data!;
  }

  async listFuels(state?: string, category?: string): Promise<FuelInfo[]> {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (category) params.append('category', category);
    
    const response = await this.request<FuelInfo[]>(
      `/calculate/fuels?${params.toString()}`
    );
    return response.data!;
  }

  async listMaterialCategories(): Promise<string[]> {
    const response = await this.request<string[]>('/calculate/categories');
    return response.data!;
  }

  // ========== PROJECT ENDPOINTS ==========

  async createProject(data: {
    project_id: string;
    project_name: string;
    postcode?: number;
    state?: string;
    ncc_volume?: string;
  }): Promise<any> {
    const response = await this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getProject(projectId: string): Promise<any> {
    const response = await this.request(`/projects/${projectId}`);
    return response.data;
  }

  async getProjectSummary(projectId: string): Promise<ProjectSummary> {
    const response = await this.request<ProjectSummary>(
      `/projects/${projectId}/summary`
    );
    return response.data!;
  }

  async getAuditLog(projectId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/projects/${projectId}/audit`);
    return response.data!;
  }

  async listProjects(state?: string, nccVolume?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (nccVolume) params.append('ncc_volume', nccVolume);
    
    const response = await this.request<any[]>(`/projects?${params.toString()}`);
    return response.data!;
  }

  // ========== REPORTS ENDPOINTS ==========

  async exportNGERReport(projectId: string): Promise<any> {
    const response = await this.request(`/reports/${projectId}/nger-json`);
    return response.data;
  }

  async exportNCCSummary(projectId: string): Promise<any> {
    const response = await this.request(`/reports/${projectId}/ncc-summary`);
    return response.data;
  }

  async getMethodologyStatement(projectId: string): Promise<any> {
    const response = await this.request(`/reports/${projectId}/methodology`);
    return response.data;
  }
}

// Export singleton instance
export const calculatorAPI = new CarbonCalculatorAPI();

// Export class for custom instances
export default CarbonCalculatorAPI;
