create table public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_definition_id uuid references public.metric_definitions(id) on delete cascade not null,
  snapshot_date date not null,
  value numeric not null,
  raw_response jsonb,
  synced_at timestamptz default now(),
  unique(metric_definition_id, snapshot_date)
);
