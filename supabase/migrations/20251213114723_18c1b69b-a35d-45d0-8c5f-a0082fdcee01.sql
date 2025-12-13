-- Update Free tier limits to be more restrictive
UPDATE subscription_tiers
SET limits = jsonb_build_object(
  'projects', 1,
  'reports_per_month', 1,
  'lca_calculations', false,
  'team_collaboration', false,
  'full_database', false,
  'en15978_calculators', false,
  'boq_uploader', false,
  'material_comparer', false
)
WHERE name = 'Free';

-- Update Pro tier limits to include all features
UPDATE subscription_tiers
SET limits = jsonb_build_object(
  'projects', -1,
  'reports_per_month', -1,
  'lca_calculations', true,
  'team_collaboration', false,
  'full_database', true,
  'en15978_calculators', true,
  'boq_uploader', true,
  'material_comparer', true
)
WHERE name = 'Pro';

-- Update Business tier limits to include all features
UPDATE subscription_tiers
SET limits = jsonb_build_object(
  'projects', -1,
  'reports_per_month', -1,
  'lca_calculations', true,
  'team_collaboration', true,
  'team_size', 10,
  'api_access', true,
  'full_database', true,
  'en15978_calculators', true,
  'boq_uploader', true,
  'material_comparer', true
)
WHERE name = 'Business';

-- Update Enterprise tier limits to include all features
UPDATE subscription_tiers
SET limits = jsonb_build_object(
  'projects', -1,
  'reports_per_month', -1,
  'lca_calculations', true,
  'team_collaboration', true,
  'team_size', -1,
  'api_access', true,
  'custom_integrations', true,
  'full_database', true,
  'en15978_calculators', true,
  'boq_uploader', true,
  'material_comparer', true
)
WHERE name = 'Enterprise';