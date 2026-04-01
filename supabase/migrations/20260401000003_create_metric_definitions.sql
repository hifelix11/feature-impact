create type analysis_type as enum ('funnel', 'report', 'segmentation', 'retention');

create table public.metric_definitions (
  id uuid primary key default gen_random_uuid(),
  feature_id uuid references public.features(id) on delete cascade not null,
  name text not null,
  analysis_type analysis_type not null,
  bloomreach_analysis_id text not null,
  value_extraction_path jsonb not null default '{}',
  unit text default '',
  expected_direction expected_direction,
  sort_order integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger metric_definitions_updated_at
  before update on public.metric_definitions
  for each row execute function update_updated_at();
