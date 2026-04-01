-- Features indexes
create index idx_features_organization_id on public.features(organization_id);
create index idx_features_status on public.features(status);
create index idx_features_deploy_date on public.features(deploy_date);
create index idx_features_tags on public.features using gin(tags);
create index idx_features_org_status on public.features(organization_id, status);

-- Metric Definitions indexes
create index idx_metric_definitions_feature_id on public.metric_definitions(feature_id);
create index idx_metric_definitions_analysis_id on public.metric_definitions(bloomreach_analysis_id);

-- Metric Snapshots indexes
create index idx_metric_snapshots_definition_id on public.metric_snapshots(metric_definition_id);
create index idx_metric_snapshots_date on public.metric_snapshots(snapshot_date);
create index idx_metric_snapshots_definition_date on public.metric_snapshots(metric_definition_id, snapshot_date);

-- Analyses indexes
create index idx_analyses_feature_id on public.analyses(feature_id);
create index idx_analyses_generated_at on public.analyses(generated_at);

-- Screenshots indexes
create index idx_screenshots_feature_id on public.screenshots(feature_id);
create index idx_screenshots_type on public.screenshots(feature_id, type);

-- Connections indexes
create index idx_connections_organization_id on public.connections(organization_id);
create index idx_connections_active on public.connections(is_active) where is_active = true;

-- Organization Members indexes
create index idx_org_members_user_id on public.organization_members(user_id);
create index idx_org_members_org_id on public.organization_members(organization_id);
