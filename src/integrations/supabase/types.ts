export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      emission_factors: {
        Row: {
          category: string
          created_at: string
          factor_value: number
          fuel_type: string | null
          id: string
          methodology: string | null
          region: string | null
          scope: number | null
          source: string
          subcategory: string | null
          uncertainty_range: string | null
          unit: string
          updated_at: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          factor_value: number
          fuel_type?: string | null
          id?: string
          methodology?: string | null
          region?: string | null
          scope?: number | null
          source: string
          subcategory?: string | null
          uncertainty_range?: string | null
          unit: string
          updated_at?: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          factor_value?: number
          fuel_type?: string | null
          id?: string
          methodology?: string | null
          region?: string | null
          scope?: number | null
          source?: string
          subcategory?: string | null
          uncertainty_range?: string | null
          unit?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      lca_materials: {
        Row: {
          created_at: string
          data_source: string | null
          embodied_carbon_a1a3: number | null
          embodied_carbon_a4: number | null
          embodied_carbon_a5: number | null
          embodied_carbon_total: number | null
          id: string
          material_category: string
          material_name: string
          region: string | null
          unit: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          embodied_carbon_a1a3?: number | null
          embodied_carbon_a4?: number | null
          embodied_carbon_a5?: number | null
          embodied_carbon_total?: number | null
          id?: string
          material_category: string
          material_name: string
          region?: string | null
          unit: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          data_source?: string | null
          embodied_carbon_a1a3?: number | null
          embodied_carbon_a4?: number | null
          embodied_carbon_a5?: number | null
          embodied_carbon_total?: number | null
          id?: string
          material_category?: string
          material_name?: string
          region?: string | null
          unit?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      materials_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_name: string
          file_path: string
          id: string
          records_processed: number | null
          records_total: number | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_name: string
          file_path: string
          id?: string
          records_processed?: number | null
          records_total?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_name?: string
          file_path?: string
          id?: string
          records_processed?: number | null
          records_total?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          assessment_period_end: string | null
          assessment_period_start: string | null
          created_at: string
          description: string | null
          green_star_target: number | null
          id: string
          location: string | null
          nabers_target: number | null
          name: string
          ncc_compliance_level: string | null
          project_type: string
          size_sqm: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_period_end?: string | null
          assessment_period_start?: string | null
          created_at?: string
          description?: string | null
          green_star_target?: number | null
          id?: string
          location?: string | null
          nabers_target?: number | null
          name: string
          ncc_compliance_level?: string | null
          project_type?: string
          size_sqm?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_period_end?: string | null
          assessment_period_start?: string | null
          created_at?: string
          description?: string | null
          green_star_target?: number | null
          id?: string
          location?: string | null
          nabers_target?: number | null
          name?: string
          ncc_compliance_level?: string | null
          project_type?: string
          size_sqm?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          compliance_status: string | null
          created_at: string
          generated_at: string
          id: string
          project_id: string
          report_data: Json | null
          report_type: string
          total_emissions: number | null
          total_scope1: number | null
          total_scope2: number | null
          total_scope3: number | null
        }
        Insert: {
          compliance_status?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          project_id: string
          report_data?: Json | null
          report_type: string
          total_emissions?: number | null
          total_scope1?: number | null
          total_scope2?: number | null
          total_scope3?: number | null
        }
        Update: {
          compliance_status?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          project_id?: string
          report_data?: Json | null
          report_type?: string
          total_emissions?: number | null
          total_scope1?: number | null
          total_scope2?: number | null
          total_scope3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scope1_emissions: {
        Row: {
          calculation_method: string | null
          category: string
          created_at: string
          data_quality: string | null
          emission_factor: number | null
          emissions_tco2e: number
          fuel_type: string | null
          id: string
          notes: string | null
          project_id: string
          quantity: number
          subcategory: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          calculation_method?: string | null
          category: string
          created_at?: string
          data_quality?: string | null
          emission_factor?: number | null
          emissions_tco2e?: number
          fuel_type?: string | null
          id?: string
          notes?: string | null
          project_id: string
          quantity?: number
          subcategory?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          calculation_method?: string | null
          category?: string
          created_at?: string
          data_quality?: string | null
          emission_factor?: number | null
          emissions_tco2e?: number
          fuel_type?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          quantity?: number
          subcategory?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scope1_emissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scope2_emissions: {
        Row: {
          calculation_method: string | null
          created_at: string
          data_quality: string | null
          emission_factor: number | null
          emissions_tco2e: number
          energy_type: string
          id: string
          notes: string | null
          project_id: string
          quantity: number
          renewable_percentage: number | null
          state_region: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          calculation_method?: string | null
          created_at?: string
          data_quality?: string | null
          emission_factor?: number | null
          emissions_tco2e?: number
          energy_type: string
          id?: string
          notes?: string | null
          project_id: string
          quantity?: number
          renewable_percentage?: number | null
          state_region?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          calculation_method?: string | null
          created_at?: string
          data_quality?: string | null
          emission_factor?: number | null
          emissions_tco2e?: number
          energy_type?: string
          id?: string
          notes?: string | null
          project_id?: string
          quantity?: number
          renewable_percentage?: number | null
          state_region?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scope2_emissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scope3_emissions: {
        Row: {
          activity_description: string | null
          calculation_method: string | null
          category: number
          category_name: string
          created_at: string
          data_quality: string | null
          emission_factor: number | null
          emissions_tco2e: number
          id: string
          lca_stage: string | null
          notes: string | null
          project_id: string
          quantity: number
          subcategory: string | null
          supplier_data: boolean | null
          unit: string
          updated_at: string
        }
        Insert: {
          activity_description?: string | null
          calculation_method?: string | null
          category: number
          category_name: string
          created_at?: string
          data_quality?: string | null
          emission_factor?: number | null
          emissions_tco2e?: number
          id?: string
          lca_stage?: string | null
          notes?: string | null
          project_id: string
          quantity?: number
          subcategory?: string | null
          supplier_data?: boolean | null
          unit: string
          updated_at?: string
        }
        Update: {
          activity_description?: string | null
          calculation_method?: string | null
          category?: number
          category_name?: string
          created_at?: string
          data_quality?: string | null
          emission_factor?: number | null
          emissions_tco2e?: number
          id?: string
          lca_stage?: string | null
          notes?: string | null
          project_id?: string
          quantity?: number
          subcategory?: string | null
          supplier_data?: boolean | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scope3_emissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          display_order: number
          features: Json
          id: string
          is_active: boolean
          limits: Json
          name: string
          price_annual: number | null
          price_monthly: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name: string
          price_annual?: number | null
          price_monthly?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name?: string
          price_annual?: number | null
          price_monthly?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unified_calculations: {
        Row: {
          created_at: string | null
          electricity_inputs: Json | null
          fuel_inputs: Json | null
          id: string
          is_draft: boolean | null
          materials: Json | null
          project_id: string
          totals: Json | null
          transport_inputs: Json | null
          updated_at: string | null
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string | null
          electricity_inputs?: Json | null
          fuel_inputs?: Json | null
          id?: string
          is_draft?: boolean | null
          materials?: Json | null
          project_id: string
          totals?: Json | null
          transport_inputs?: Json | null
          updated_at?: string | null
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string | null
          electricity_inputs?: Json | null
          fuel_inputs?: Json | null
          id?: string
          is_draft?: boolean | null
          materials?: Json | null
          project_id?: string
          totals?: Json | null
          transport_inputs?: Json | null
          updated_at?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "unified_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          count: number
          created_at: string
          id: string
          metric_type: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          metric_type: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          metric_type?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier_id: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id: string
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_perform_action: {
        Args: { action_type: string; user_id_param: string }
        Returns: boolean
      }
      get_user_tier: {
        Args: { user_id_param: string }
        Returns: {
          subscription_status: string
          tier_limits: Json
          tier_name: string
          trial_active: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
