create table public.connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  provider text not null default 'bloomreach',
  api_url text not null,
  project_token text not null,
  api_key_id text not null,
  api_secret_encrypted text not null,
  sync_interval_hours integer default 6,
  auto_ai_analysis boolean default true,
  default_comparison_window_days integer default 14,
  is_active boolean default true,
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger connections_updated_at
  before update on public.connections
  for each row execute function update_updated_at();
