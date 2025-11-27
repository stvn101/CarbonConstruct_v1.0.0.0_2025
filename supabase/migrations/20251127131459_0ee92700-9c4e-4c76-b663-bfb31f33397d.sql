-- Performance Optimization: Add indexes for frequently queried columns

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Scope emissions indexes
CREATE INDEX IF NOT EXISTS idx_scope1_emissions_project_id ON public.scope1_emissions(project_id);
CREATE INDEX IF NOT EXISTS idx_scope2_emissions_project_id ON public.scope2_emissions(project_id);
CREATE INDEX IF NOT EXISTS idx_scope3_emissions_project_id ON public.scope3_emissions(project_id);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Unified calculations indexes
CREATE INDEX IF NOT EXISTS idx_unified_calculations_project_id ON public.unified_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_unified_calculations_user_id ON public.unified_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_calculations_updated_at ON public.unified_calculations(updated_at DESC);

-- Usage metrics indexes
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON public.usage_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON public.usage_metrics(metric_type);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON public.reports(generated_at DESC);

-- Error logs indexes (for admin monitoring)
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);

-- LCA materials indexes (for material lookups)
CREATE INDEX IF NOT EXISTS idx_lca_materials_category ON public.lca_materials(material_category);
CREATE INDEX IF NOT EXISTS idx_lca_materials_name ON public.lca_materials(material_name);

-- Emission factors indexes
CREATE INDEX IF NOT EXISTS idx_emission_factors_category ON public.emission_factors(category);
CREATE INDEX IF NOT EXISTS idx_emission_factors_scope ON public.emission_factors(scope);
CREATE INDEX IF NOT EXISTS idx_emission_factors_year ON public.emission_factors(year DESC);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

-- User roles index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);