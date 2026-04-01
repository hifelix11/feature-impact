create type feature_status as enum ('planned', 'monitoring', 'concluded', 'inconclusive');
create type expected_direction as enum ('up', 'down');

create table public.features (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  description text,
  status feature_status not null default 'planned',
  deploy_date date,
  deploy_timestamp timestamptz,
  hypothesis text,
  expected_direction expected_direction,
  expected_change_pct numeric(5,2),
  owner text,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  concluded_at timestamptz
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger features_updated_at
  before update on public.features
  for each row execute function update_updated_at();
