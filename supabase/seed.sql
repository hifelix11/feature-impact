-- Seed data for Pulse - Feature Impact Tracker
-- This creates a demo organization with a sample feature and metrics

-- Create demo organization
insert into public.organizations (id, name, slug)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo Company',
  'demo'
);

-- Create a sample feature
insert into public.features (
  id, organization_id, name, description, status,
  deploy_date, deploy_timestamp, hypothesis,
  expected_direction, expected_change_pct, owner, tags
)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Redesigned Checkout Flow',
  'Simplified the checkout process from 5 steps to 3 steps with progress indicator',
  'monitoring',
  '2026-03-15',
  '2026-03-15T10:00:00Z',
  'Reducing checkout steps will increase conversion rate by 10-15%',
  'up',
  12.00,
  'Product Team',
  array['checkout', 'conversion', 'ux']
);

-- Create metric definitions
insert into public.metric_definitions (
  id, feature_id, name, analysis_type,
  bloomreach_analysis_id, value_extraction_path,
  unit, expected_direction, sort_order, is_primary
)
values
(
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  'Checkout Conversion Rate',
  'funnel',
  'analysis_abc123',
  '{"path": "steps[-1].conversion_rate"}',
  '%',
  'up',
  0,
  true
),
(
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000010',
  'Average Order Value',
  'segmentation',
  'analysis_def456',
  '{"path": "segments[0].value"}',
  'USD',
  'up',
  1,
  false
),
(
  '00000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000010',
  'Cart Abandonment Rate',
  'funnel',
  'analysis_ghi789',
  '{"path": "steps[1].drop_off_rate"}',
  '%',
  'down',
  2,
  false
);

-- Create metric snapshots (pre-deploy: March 1-14, post-deploy: March 15-28)
-- Checkout Conversion Rate snapshots
insert into public.metric_snapshots (metric_definition_id, snapshot_date, value)
values
  -- Pre-deploy period
  ('00000000-0000-0000-0000-000000000020', '2026-03-01', 3.2),
  ('00000000-0000-0000-0000-000000000020', '2026-03-02', 3.1),
  ('00000000-0000-0000-0000-000000000020', '2026-03-03', 3.4),
  ('00000000-0000-0000-0000-000000000020', '2026-03-04', 3.0),
  ('00000000-0000-0000-0000-000000000020', '2026-03-05', 3.3),
  ('00000000-0000-0000-0000-000000000020', '2026-03-06', 3.5),
  ('00000000-0000-0000-0000-000000000020', '2026-03-07', 3.2),
  ('00000000-0000-0000-0000-000000000020', '2026-03-08', 3.1),
  ('00000000-0000-0000-0000-000000000020', '2026-03-09', 3.3),
  ('00000000-0000-0000-0000-000000000020', '2026-03-10', 3.4),
  ('00000000-0000-0000-0000-000000000020', '2026-03-11', 3.2),
  ('00000000-0000-0000-0000-000000000020', '2026-03-12', 3.3),
  ('00000000-0000-0000-0000-000000000020', '2026-03-13', 3.1),
  ('00000000-0000-0000-0000-000000000020', '2026-03-14', 3.4),
  -- Post-deploy period (showing improvement)
  ('00000000-0000-0000-0000-000000000020', '2026-03-15', 3.5),
  ('00000000-0000-0000-0000-000000000020', '2026-03-16', 3.6),
  ('00000000-0000-0000-0000-000000000020', '2026-03-17', 3.8),
  ('00000000-0000-0000-0000-000000000020', '2026-03-18', 3.7),
  ('00000000-0000-0000-0000-000000000020', '2026-03-19', 3.9),
  ('00000000-0000-0000-0000-000000000020', '2026-03-20', 3.8),
  ('00000000-0000-0000-0000-000000000020', '2026-03-21', 4.0),
  ('00000000-0000-0000-0000-000000000020', '2026-03-22', 3.9),
  ('00000000-0000-0000-0000-000000000020', '2026-03-23', 3.7),
  ('00000000-0000-0000-0000-000000000020', '2026-03-24', 3.8),
  ('00000000-0000-0000-0000-000000000020', '2026-03-25', 4.1),
  ('00000000-0000-0000-0000-000000000020', '2026-03-26', 3.9),
  ('00000000-0000-0000-0000-000000000020', '2026-03-27', 4.0),
  ('00000000-0000-0000-0000-000000000020', '2026-03-28', 3.8);

-- Average Order Value snapshots
insert into public.metric_snapshots (metric_definition_id, snapshot_date, value)
values
  ('00000000-0000-0000-0000-000000000021', '2026-03-01', 85.50),
  ('00000000-0000-0000-0000-000000000021', '2026-03-07', 87.20),
  ('00000000-0000-0000-0000-000000000021', '2026-03-14', 84.90),
  ('00000000-0000-0000-0000-000000000021', '2026-03-21', 89.10),
  ('00000000-0000-0000-0000-000000000021', '2026-03-28', 91.30);

-- Cart Abandonment Rate snapshots
insert into public.metric_snapshots (metric_definition_id, snapshot_date, value)
values
  ('00000000-0000-0000-0000-000000000022', '2026-03-01', 68.5),
  ('00000000-0000-0000-0000-000000000022', '2026-03-07', 67.8),
  ('00000000-0000-0000-0000-000000000022', '2026-03-14', 69.1),
  ('00000000-0000-0000-0000-000000000022', '2026-03-21', 62.3),
  ('00000000-0000-0000-0000-000000000022', '2026-03-28', 59.7);

-- Create a sample connection
insert into public.connections (
  id, organization_id, provider, api_url,
  project_token, api_key_id, api_secret_encrypted,
  sync_interval_hours, auto_ai_analysis,
  default_comparison_window_days, is_active
)
values (
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'bloomreach',
  'https://api.bloomreach.com',
  'demo-project-token',
  'demo-api-key-id',
  'encrypted:demo-secret-placeholder',
  6,
  true,
  14,
  true
);

-- Create a sample analysis
insert into public.analyses (
  id, feature_id,
  pre_period_start, pre_period_end,
  post_period_start, post_period_end,
  summary, key_findings, concerns,
  recommendation, confidence, model_used
)
values (
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000010',
  '2026-03-01',
  '2026-03-14',
  '2026-03-15',
  '2026-03-28',
  'The redesigned checkout flow shows a positive impact on conversion rates. The primary metric (Checkout Conversion Rate) increased from an average of 3.25% to 3.83%, representing an 18% improvement that exceeds the initial hypothesis of 10-15%.',
  '[
    {"metric": "Checkout Conversion Rate", "change_pct": 17.8, "direction": "up", "detail": "Conversion rate improved from 3.25% avg to 3.83% avg"},
    {"metric": "Cart Abandonment Rate", "change_pct": -10.5, "direction": "down", "detail": "Abandonment dropped from 68.5% to 61.0% avg"},
    {"metric": "Average Order Value", "change_pct": 4.9, "direction": "up", "detail": "AOV increased from $85.87 to $90.20 avg"}
  ]',
  '[
    {"type": "sample_size", "detail": "Only 14 days of post-deploy data — recommend waiting for 30 days"},
    {"type": "seasonality", "detail": "March may have seasonal effects; compare YoY if possible"}
  ]',
  'Continue monitoring. Early results are promising and exceed the hypothesis. Recommend extending the observation period to 30 days before concluding.',
  'medium',
  'claude-sonnet-4-20250514'
);
