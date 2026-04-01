create type confidence_level as enum ('low', 'medium', 'high');

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  feature_id uuid references public.features(id) on delete cascade not null,
  pre_period_start date not null,
  pre_period_end date not null,
  post_period_start date not null,
  post_period_end date not null,
  summary text not null,
  key_findings jsonb not null default '[]',
  concerns jsonb not null default '[]',
  recommendation text,
  confidence confidence_level,
  prompt_context jsonb,
  model_used text,
  screenshot_before_url text,
  screenshot_after_url text,
  generated_at timestamptz default now(),
  generated_by uuid references auth.users(id),
  input_tokens integer,
  output_tokens integer
);
