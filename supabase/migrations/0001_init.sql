-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists pgjwt;

-- Enums
create type user_role as enum ('farmer','vet','regulator');
create type language as enum ('en','hi');
create type livestock_type as enum ('pig','poultry');
create type record_status as enum ('Pending','Approved','Rejected');
create type module_type as enum ('video','pdf','quiz');
create type risk_level_enum as enum ('low','medium','high');
create type alert_severity as enum ('low','medium','high');

-- Users profile mirrors auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  role user_role not null default 'farmer',
  language_preference language not null default 'en',
  created_at timestamptz not null default now()
);
create index if not exists users_role_idx on public.users(role);

-- Farms
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.users(id) on delete cascade,
  farm_name text not null,
  location text,
  livestock_type livestock_type not null,
  herd_size integer not null check (herd_size >= 0),
  biosecurity_level risk_level_enum,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists farms_farmer_id_idx on public.farms(farmer_id);
create index if not exists farms_livestock_type_idx on public.farms(livestock_type);

-- Risk Assessments
create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  date timestamptz not null default now(),
  score integer not null check (score >= 0 and score <= 100),
  risk_level risk_level_enum not null default 'low',
  assessment_details jsonb not null default '{}'::jsonb
);
create index if not exists risk_assessments_farm_id_idx on public.risk_assessments(farm_id);
create index if not exists risk_assessments_date_idx on public.risk_assessments(date desc);

-- Training Modules
create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type module_type not null,
  link text not null,
  livestock_type livestock_type not null,
  language language not null default 'en',
  created_at timestamptz not null default now()
);
create index if not exists training_modules_filters_idx on public.training_modules(livestock_type, language, type);

-- Compliance Records
create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  document_type text not null,
  file_url text not null,
  status record_status not null default 'Pending',
  submission_date timestamptz not null default now(),
  submitted_by uuid not null references public.users(id) on delete set null
);
create index if not exists compliance_records_farm_id_idx on public.compliance_records(farm_id);
create index if not exists compliance_records_status_idx on public.compliance_records(status);

-- Alerts
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  disease_name text not null,
  description text,
  location text not null,
  severity alert_severity not null,
  issued_by uuid references public.users(id) on delete set null,
  issued_date timestamptz not null default now()
);
create index if not exists alerts_severity_idx on public.alerts(severity);
create index if not exists alerts_location_idx on public.alerts(location);
create index if not exists alerts_issued_date_idx on public.alerts(issued_date desc);

-- Push notification tokens
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null unique,
  platform text,
  created_at timestamptz not null default now()
);
create index if not exists push_tokens_user_idx on public.push_tokens(user_id);

-- Calculate risk level function
create or replace function public.calculate_risk_level(p_score integer)
returns risk_level_enum
language sql immutable as $$
  select case
    when p_score < 40 then 'low'::risk_level_enum
    when p_score <= 75 then 'medium'::risk_level_enum
    else 'high'::risk_level_enum
  end;
$$;

-- Trigger to set risk_level based on score
create or replace function public.set_risk_level()
returns trigger language plpgsql as $$
begin
  new.risk_level := public.calculate_risk_level(new.score);
  return new;
end;$$;

create trigger trg_set_risk_level
before insert or update of score on public.risk_assessments
for each row execute function public.set_risk_level();

-- Updated at trigger for farms
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger trg_farms_updated_at
before update on public.farms
for each row execute function public.set_updated_at();

-- Profile auto-create on auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''))
  on conflict (id) do nothing;
  return new;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;
alter table public.farms enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.training_modules enable row level security;
alter table public.compliance_records enable row level security;
alter table public.alerts enable row level security;
alter table public.push_tokens enable row level security;

-- Helper to check role of current user
create or replace function public.current_user_role()
returns user_role language sql stable as $$
  select role from public.users where id = auth.uid();
$$;

-- Policies: users
create policy "Users can view self" on public.users
  for select using (id = auth.uid());
create policy "Users can update self" on public.users
  for update using (id = auth.uid());
create policy "Staff can view all users" on public.users
  for select to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );

-- Policies: farms
create policy "Farmers can manage own farms" on public.farms
  for all using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
create policy "Staff can read all farms" on public.farms
  for select to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );

-- Policies: risk_assessments
create policy "Farmers read/write own farm assessments" on public.risk_assessments
  for all using (
    exists(select 1 from public.farms f where f.id = farm_id and f.farmer_id = auth.uid())
  ) with check (
    exists(select 1 from public.farms f where f.id = farm_id and f.farmer_id = auth.uid())
  );
create policy "Staff can read all assessments" on public.risk_assessments
  for select to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );

-- Policies: training_modules
create policy "Anyone authenticated can read modules" on public.training_modules
  for select to authenticated using (true);
create policy "Staff manage modules" on public.training_modules
  for all to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  ) with check (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );

-- Policies: compliance_records
create policy "Farmers read/write own compliance" on public.compliance_records
  for all using (
    exists(select 1 from public.farms f where f.id = farm_id and f.farmer_id = auth.uid())
  ) with check (
    exists(select 1 from public.farms f where f.id = farm_id and f.farmer_id = auth.uid())
  );
create policy "Staff can read and update compliance" on public.compliance_records
  for select to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );
create policy "Staff can set status" on public.compliance_records
  for update to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  ) with check (true);

-- Policies: alerts
create policy "Anyone authenticated can read alerts" on public.alerts
  for select to authenticated using (true);
create policy "Staff manage alerts" on public.alerts
  for all to authenticated using (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  ) with check (
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );

-- Policies: push_tokens
create policy "Users manage own tokens" on public.push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage bucket for compliance
insert into storage.buckets (id, name, public) values ('compliance','compliance', false)
on conflict (id) do nothing;

-- Storage policies for compliance bucket
create policy "Farmers upload to own farm folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'compliance' and
    exists(
      select 1 from public.farms f
      where f.farmer_id = auth.uid()
        and position('farm/'||f.id||'/' in name) = 1
    )
  );

create policy "Farmers read own objects" on storage.objects
  for select to authenticated using (
    bucket_id = 'compliance' and
    exists(
      select 1 from public.farms f
      where f.farmer_id = auth.uid()
        and position('farm/'||f.id||'/' in name) = 1
    )
  );

create policy "Staff read all compliance objects" on storage.objects
  for select to authenticated using (
    bucket_id = 'compliance' and
    exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('vet','regulator'))
  );
