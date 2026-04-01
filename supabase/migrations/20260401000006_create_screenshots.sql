create type screenshot_type as enum ('before', 'after');

create table public.screenshots (
  id uuid primary key default gen_random_uuid(),
  feature_id uuid references public.features(id) on delete cascade not null,
  type screenshot_type not null,
  storage_path text not null,
  file_name text,
  file_size integer,
  mime_type text,
  captured_at timestamptz,
  uploaded_at timestamptz default now(),
  uploaded_by uuid references auth.users(id)
);
