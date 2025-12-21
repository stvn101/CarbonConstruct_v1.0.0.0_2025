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
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          page_url: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_url?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_campaign_analytics: {
        Row: {
          audience: string
          campaign_id: string
          click_url: string | null
          clicked_at: string | null
          conversion_type: string | null
          converted_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          sent_at: string
          variant: string
        }
        Insert: {
          audience: string
          campaign_id: string
          click_url?: string | null
          clicked_at?: string | null
          conversion_type?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          sent_at?: string
          variant: string
        }
        Update: {
          audience?: string
          campaign_id?: string
          click_url?: string | null
          clicked_at?: string | null
          conversion_type?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string
          variant?: string
        }
        Relationships: []
      }
      email_campaign_schedules: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          name: string
          recipient_filter: Json | null
          scheduled_at: string
          sent_count: number | null
          status: string
          updated_at: string
          variant: string
        }
        Insert: {
          audience: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          name: string
          recipient_filter?: Json | null
          scheduled_at: string
          sent_count?: number | null
          status?: string
          updated_at?: string
          variant: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          name?: string
          recipient_filter?: Json | null
          scheduled_at?: string
          sent_count?: number | null
          status?: string
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
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
      epd_reminder_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          enabled: boolean
          id: string
          last_reminder_sent: string | null
          reminder_days: number[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          enabled?: boolean
          id?: string
          last_reminder_sent?: string | null
          reminder_days?: number[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          enabled?: boolean
          id?: string
          last_reminder_sent?: string | null
          reminder_days?: number[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      epd_renewal_workflows: {
        Row: {
          contact_date: string | null
          created_at: string
          epd_number: string | null
          expected_response_date: string | null
          expiry_date: string
          id: string
          manufacturer: string | null
          material_id: string
          material_name: string
          new_epd_number: string | null
          new_expiry_date: string | null
          notes: string | null
          priority: string
          received_date: string | null
          request_date: string | null
          status: string
          supplier_contact_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_date?: string | null
          created_at?: string
          epd_number?: string | null
          expected_response_date?: string | null
          expiry_date: string
          id?: string
          manufacturer?: string | null
          material_id: string
          material_name: string
          new_epd_number?: string | null
          new_expiry_date?: string | null
          notes?: string | null
          priority?: string
          received_date?: string | null
          request_date?: string | null
          status?: string
          supplier_contact_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_date?: string | null
          created_at?: string
          epd_number?: string | null
          expected_response_date?: string | null
          expiry_date?: string
          id?: string
          manufacturer?: string | null
          material_id?: string
          material_name?: string
          new_epd_number?: string | null
          new_expiry_date?: string | null
          notes?: string | null
          priority?: string
          received_date?: string | null
          request_date?: string | null
          status?: string
          supplier_contact_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epd_renewal_workflows_supplier_contact_id_fkey"
            columns: ["supplier_contact_id"]
            isOneToOne: false
            referencedRelation: "supplier_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          browser_info: Json | null
          created_at: string
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          severity: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ice_import_jobs: {
        Row: {
          column_mappings: Json | null
          completed_at: string | null
          created_at: string
          error_count: number | null
          errors: Json | null
          file_name: string
          file_size_bytes: number | null
          header_row: number | null
          id: string
          imported_count: number | null
          processed_rows: number | null
          skipped_count: number | null
          started_at: string | null
          status: string
          total_rows: number | null
          updated_at: string
          updated_count: number | null
          user_id: string
          validation_preview: Json | null
          worksheet_name: string | null
        }
        Insert: {
          column_mappings?: Json | null
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          errors?: Json | null
          file_name: string
          file_size_bytes?: number | null
          header_row?: number | null
          id?: string
          imported_count?: number | null
          processed_rows?: number | null
          skipped_count?: number | null
          started_at?: string | null
          status?: string
          total_rows?: number | null
          updated_at?: string
          updated_count?: number | null
          user_id: string
          validation_preview?: Json | null
          worksheet_name?: string | null
        }
        Update: {
          column_mappings?: Json | null
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          errors?: Json | null
          file_name?: string
          file_size_bytes?: number | null
          header_row?: number | null
          id?: string
          imported_count?: number | null
          processed_rows?: number | null
          skipped_count?: number | null
          started_at?: string | null
          status?: string
          total_rows?: number | null
          updated_at?: string
          updated_count?: number | null
          user_id?: string
          validation_preview?: Json | null
          worksheet_name?: string | null
        }
        Relationships: []
      }
      material_verification_history: {
        Row: {
          categories_count: number
          category_stats: Json
          created_at: string
          fail_count: number
          id: string
          metadata_completeness: Json
          outlier_materials: Json
          outliers_count: number
          pass_count: number
          pass_rate: number
          source_distribution: Json
          sources_count: number
          total_materials: number
          user_id: string
          verified_at: string
          warn_count: number
        }
        Insert: {
          categories_count: number
          category_stats?: Json
          created_at?: string
          fail_count: number
          id?: string
          metadata_completeness?: Json
          outlier_materials?: Json
          outliers_count?: number
          pass_count: number
          pass_rate: number
          source_distribution?: Json
          sources_count: number
          total_materials: number
          user_id: string
          verified_at?: string
          warn_count: number
        }
        Update: {
          categories_count?: number
          category_stats?: Json
          created_at?: string
          fail_count?: number
          id?: string
          metadata_completeness?: Json
          outlier_materials?: Json
          outliers_count?: number
          pass_count?: number
          pass_rate?: number
          source_distribution?: Json
          sources_count?: number
          total_materials?: number
          user_id?: string
          verified_at?: string
          warn_count?: number
        }
        Relationships: []
      }
      materials_epd: {
        Row: {
          allocation_method: string | null
          average_specific: string | null
          biogenic_carbon_kg_c: number | null
          biogenic_carbon_percentage: number | null
          carbon_sequestration: number | null
          characterisation_factor_version: string | null
          co_product_type: string | null
          created_at: string | null
          data_quality_rating: string | null
          data_quality_tier: string | null
          data_representativeness: Json | null
          data_source: string
          date_added: string | null
          date_updated: string | null
          eco_platform_compliant: boolean | null
          ecoinvent_methodology: string | null
          ef_a1a3: number | null
          ef_a4: number | null
          ef_a5: number | null
          ef_b1b5: number | null
          ef_c1c4: number | null
          ef_d: number | null
          ef_total: number
          epd_number: string | null
          epd_type: string | null
          epd_url: string | null
          expiry_date: string | null
          gwp_biogenic_a1a3: number | null
          gwp_fossil_a1a3: number | null
          gwp_luluc_a1a3: number | null
          id: string
          is_co_product: boolean | null
          lca_practitioner: string | null
          lca_verifier: string | null
          manufacturer: string | null
          manufacturing_city: string | null
          manufacturing_country: string | null
          material_category: string
          material_name: string
          notes: string | null
          number_of_sites: number | null
          plant_location: string | null
          program_operator: string | null
          publish_date: string | null
          recycled_content: number | null
          reference_year: number | null
          region: string | null
          scope1_factor: number | null
          scope2_factor: number | null
          scope3_factor: number | null
          state: string | null
          subcategory: string | null
          uncertainty_percent: number | null
          unit: string
          updated_at: string | null
          uses_mass_balance: boolean | null
          validity: string | null
          year: number | null
        }
        Insert: {
          allocation_method?: string | null
          average_specific?: string | null
          biogenic_carbon_kg_c?: number | null
          biogenic_carbon_percentage?: number | null
          carbon_sequestration?: number | null
          characterisation_factor_version?: string | null
          co_product_type?: string | null
          created_at?: string | null
          data_quality_rating?: string | null
          data_quality_tier?: string | null
          data_representativeness?: Json | null
          data_source: string
          date_added?: string | null
          date_updated?: string | null
          eco_platform_compliant?: boolean | null
          ecoinvent_methodology?: string | null
          ef_a1a3?: number | null
          ef_a4?: number | null
          ef_a5?: number | null
          ef_b1b5?: number | null
          ef_c1c4?: number | null
          ef_d?: number | null
          ef_total: number
          epd_number?: string | null
          epd_type?: string | null
          epd_url?: string | null
          expiry_date?: string | null
          gwp_biogenic_a1a3?: number | null
          gwp_fossil_a1a3?: number | null
          gwp_luluc_a1a3?: number | null
          id?: string
          is_co_product?: boolean | null
          lca_practitioner?: string | null
          lca_verifier?: string | null
          manufacturer?: string | null
          manufacturing_city?: string | null
          manufacturing_country?: string | null
          material_category: string
          material_name: string
          notes?: string | null
          number_of_sites?: number | null
          plant_location?: string | null
          program_operator?: string | null
          publish_date?: string | null
          recycled_content?: number | null
          reference_year?: number | null
          region?: string | null
          scope1_factor?: number | null
          scope2_factor?: number | null
          scope3_factor?: number | null
          state?: string | null
          subcategory?: string | null
          uncertainty_percent?: number | null
          unit: string
          updated_at?: string | null
          uses_mass_balance?: boolean | null
          validity?: string | null
          year?: number | null
        }
        Update: {
          allocation_method?: string | null
          average_specific?: string | null
          biogenic_carbon_kg_c?: number | null
          biogenic_carbon_percentage?: number | null
          carbon_sequestration?: number | null
          characterisation_factor_version?: string | null
          co_product_type?: string | null
          created_at?: string | null
          data_quality_rating?: string | null
          data_quality_tier?: string | null
          data_representativeness?: Json | null
          data_source?: string
          date_added?: string | null
          date_updated?: string | null
          eco_platform_compliant?: boolean | null
          ecoinvent_methodology?: string | null
          ef_a1a3?: number | null
          ef_a4?: number | null
          ef_a5?: number | null
          ef_b1b5?: number | null
          ef_c1c4?: number | null
          ef_d?: number | null
          ef_total?: number
          epd_number?: string | null
          epd_type?: string | null
          epd_url?: string | null
          expiry_date?: string | null
          gwp_biogenic_a1a3?: number | null
          gwp_fossil_a1a3?: number | null
          gwp_luluc_a1a3?: number | null
          id?: string
          is_co_product?: boolean | null
          lca_practitioner?: string | null
          lca_verifier?: string | null
          manufacturer?: string | null
          manufacturing_city?: string | null
          manufacturing_country?: string | null
          material_category?: string
          material_name?: string
          notes?: string | null
          number_of_sites?: number | null
          plant_location?: string | null
          program_operator?: string | null
          publish_date?: string | null
          recycled_content?: number | null
          reference_year?: number | null
          region?: string | null
          scope1_factor?: number | null
          scope2_factor?: number | null
          scope3_factor?: number | null
          state?: string | null
          subcategory?: string | null
          uncertainty_percent?: number | null
          unit?: string
          updated_at?: string | null
          uses_mass_balance?: boolean | null
          validity?: string | null
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
      performance_metrics: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          page_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          page_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          page_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          assessment_period_end: string | null
          assessment_period_start: string | null
          created_at: string
          description: string | null
          eco_compliance_enabled: boolean | null
          eco_compliance_report: Json | null
          electricity_modelling_approach: string | null
          electricity_percentage_a1a3: number | null
          green_star_target: number | null
          grid_factor_source: string | null
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
          eco_compliance_enabled?: boolean | null
          eco_compliance_report?: Json | null
          electricity_modelling_approach?: string | null
          electricity_percentage_a1a3?: number | null
          green_star_target?: number | null
          grid_factor_source?: string | null
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
          eco_compliance_enabled?: boolean | null
          eco_compliance_report?: Json | null
          electricity_modelling_approach?: string | null
          electricity_percentage_a1a3?: number | null
          green_star_target?: number | null
          grid_factor_source?: string | null
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
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          updated_at: string | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          updated_at?: string | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          updated_at?: string | null
          user_id?: string
          window_start?: string | null
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
          stripe_price_id_yearly: string | null
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
          stripe_price_id_yearly?: string | null
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
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      supplier_contacts: {
        Row: {
          address: string | null
          company_name: string
          contact_name: string | null
          contact_type: string
          created_at: string
          email: string | null
          epd_numbers: string[] | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_name?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          epd_numbers?: string[] | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_name?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          epd_numbers?: string[] | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
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
      user_material_favorites: {
        Row: {
          created_at: string | null
          epd_number: string | null
          factor: number
          id: string
          last_used: string | null
          material_category: string
          material_id: string
          material_name: string
          source: string | null
          unit: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          epd_number?: string | null
          factor: number
          id?: string
          last_used?: string | null
          material_category: string
          material_id: string
          material_name: string
          source?: string | null
          unit: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          epd_number?: string | null
          factor?: number
          id?: string
          last_used?: string | null
          material_category?: string
          material_id?: string
          material_name?: string
          source?: string | null
          unit?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          account_status: string
          analytics_enabled: boolean | null
          cookie_consent: string | null
          created_at: string | null
          deletion_scheduled_at: string | null
          deletion_token: string | null
          id: string
          marketing_enabled: boolean | null
          preferences_data: Json | null
          status_changed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_status?: string
          analytics_enabled?: boolean | null
          cookie_consent?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          deletion_token?: string | null
          id?: string
          marketing_enabled?: boolean | null
          preferences_data?: Json | null
          status_changed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_status?: string
          analytics_enabled?: boolean | null
          cookie_consent?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          deletion_token?: string | null
          id?: string
          marketing_enabled?: boolean | null
          preferences_data?: Json | null
          status_changed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      user_preferences_safe: {
        Row: {
          account_status: string | null
          analytics_enabled: boolean | null
          cookie_consent: string | null
          created_at: string | null
          deletion_scheduled_at: string | null
          id: string | null
          marketing_enabled: boolean | null
          preferences_data: Json | null
          status_changed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_status?: string | null
          analytics_enabled?: boolean | null
          cookie_consent?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          id?: string | null
          marketing_enabled?: boolean | null
          preferences_data?: Json | null
          status_changed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_status?: string | null
          analytics_enabled?: boolean | null
          cookie_consent?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          id?: string | null
          marketing_enabled?: boolean | null
          preferences_data?: Json | null
          status_changed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions_safe: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string | null
          status: string | null
          tier_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          status?: string | null
          tier_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          status?: string | null
          tier_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string | null
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
    Functions: {
      can_perform_action: {
        Args: { action_type: string; user_id_param: string }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_user_preferences: {
        Args: { p_user_id: string }
        Returns: {
          account_status: string
          analytics_enabled: boolean
          cookie_consent: string
          created_at: string
          deletion_scheduled_at: string
          id: string
          marketing_enabled: boolean
          preferences_data: Json
          status_changed_at: string
          updated_at: string
          user_id: string
        }[]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
