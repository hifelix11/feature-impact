-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.features enable row level security;
alter table public.metric_definitions enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.analyses enable row level security;
alter table public.screenshots enable row level security;
alter table public.connections enable row level security;

-- Helper function: get organization IDs for the current user
create or replace function public.get_user_org_ids()
returns setof uuid as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid()
$$ language sql security definer stable;

-- ============================================
-- Organizations
-- ============================================
create policy "Users can view their organizations"
  on public.organizations for select
  using (id in (select public.get_user_org_ids()));

create policy "Owners can update their organizations"
  on public.organizations for update
  using (
    id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================
-- Organization Members
-- ============================================
create policy "Members can view other members in their org"
  on public.organization_members for select
  using (organization_id in (select public.get_user_org_ids()));

create policy "Admins can insert members"
  on public.organization_members for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins can update members"
  on public.organization_members for update
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins can delete members"
  on public.organization_members for delete
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================
-- Features (full CRUD)
-- ============================================
create policy "Users can view features in their org"
  on public.features for select
  using (organization_id in (select public.get_user_org_ids()));

create policy "Members can create features in their org"
  on public.features for insert
  with check (organization_id in (select public.get_user_org_ids()));

create policy "Members can update features in their org"
  on public.features for update
  using (organization_id in (select public.get_user_org_ids()));

create policy "Admins can delete features in their org"
  on public.features for delete
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================
-- Metric Definitions (full CRUD)
-- ============================================
create policy "Users can view metric definitions for their features"
  on public.metric_definitions for select
  using (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can create metric definitions"
  on public.metric_definitions for insert
  with check (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can update metric definitions"
  on public.metric_definitions for update
  using (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Admins can delete metric definitions"
  on public.metric_definitions for delete
  using (
    feature_id in (
      select id from public.features
      where organization_id in (
        select organization_id from public.organization_members
        where user_id = auth.uid() and role in ('owner', 'admin')
      )
    )
  );

-- ============================================
-- Metric Snapshots
-- ============================================
create policy "Users can view snapshots for their metrics"
  on public.metric_snapshots for select
  using (
    metric_definition_id in (
      select md.id from public.metric_definitions md
      join public.features f on f.id = md.feature_id
      where f.organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can insert snapshots"
  on public.metric_snapshots for insert
  with check (
    metric_definition_id in (
      select md.id from public.metric_definitions md
      join public.features f on f.id = md.feature_id
      where f.organization_id in (select public.get_user_org_ids())
    )
  );

-- ============================================
-- Analyses
-- ============================================
create policy "Users can view analyses for their features"
  on public.analyses for select
  using (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can create analyses"
  on public.analyses for insert
  with check (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can delete analyses"
  on public.analyses for delete
  using (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

-- ============================================
-- Screenshots
-- ============================================
create policy "Users can view screenshots for their features"
  on public.screenshots for select
  using (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can upload screenshots"
  on public.screenshots for insert
  with check (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can delete screenshots"
  on public.screenshots for delete
  using (
    feature_id in (
      select id from public.features
      where organization_id in (select public.get_user_org_ids())
    )
  );

-- ============================================
-- Connections
-- ============================================
create policy "Users can view connections in their org"
  on public.connections for select
  using (organization_id in (select public.get_user_org_ids()));

create policy "Admins can create connections"
  on public.connections for insert
  with check (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins can update connections"
  on public.connections for update
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins can delete connections"
  on public.connections for delete
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- ============================================
-- Storage bucket for screenshots
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'screenshots',
  'screenshots',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);

create policy "Users can view screenshot files"
  on storage.objects for select
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select f.id::text from public.features f
      where f.organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can upload screenshot files"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select f.id::text from public.features f
      where f.organization_id in (select public.get_user_org_ids())
    )
  );

create policy "Members can delete screenshot files"
  on storage.objects for delete
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] in (
      select f.id::text from public.features f
      where f.organization_id in (select public.get_user_org_ids())
    )
  );
