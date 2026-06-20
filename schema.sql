-- Neura Supabase schema. Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  age int,
  sex text,
  language text default 'en',
  conditions text,
  allergies text,
  emergency_contact text,
  role text default 'user' check (role in ('user','admin')),
  subscription_status text default 'inactive' check (subscription_status in ('inactive','pending','active','expired','rejected')),
  subscription_plan text,
  subscription_expires_at timestamptz,
  support_consent_until timestamptz,
  memory_summary text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly','yearly')),
  amount_bdt int not null,
  method text,
  transaction_id text,
  sender_phone text,
  note text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  file_name text,
  file_type text,
  kind text default 'report',
  summary text,
  extracted jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  report_id uuid references reports(id) on delete set null,
  name text not null,
  dose text,
  instruction text,
  doctor_name text,
  start_date date default current_date,
  end_date date,
  confirmed_by_user boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists medication_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  medication_id uuid references medications(id) on delete cascade,
  time_of_day time not null,
  days_of_week int[] default array[0,1,2,3,4,5,6],
  timezone text default 'Asia/Dhaka',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists medication_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  medication_id uuid references medications(id) on delete cascade,
  schedule_id uuid references medication_schedules(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text default 'pending' check (status in ('pending','sent','taken','snoozed','skipped','missed','failed')),
  sent_at timestamptz,
  taken_at timestamptz,
  snoozed_until timestamptz,
  created_at timestamptz default now()
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  endpoint text unique not null,
  subscription jsonb not null,
  active boolean default true,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  role text not null check(role in ('user','agent')),
  content text not null,
  patient_context text default 'unknown' check(patient_context in ('self','someone_else','unknown')),
  risk text,
  created_at timestamptz default now()
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  feeling text,
  sleep_hours numeric,
  steps int,
  note text,
  created_at timestamptz default now()
);

create table if not exists doctor_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  clinic text,
  city text default 'Dhaka',
  area text,
  phone text,
  address text,
  source_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists risk_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  risk text,
  message text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table payment_requests enable row level security;
alter table reports enable row level security;
alter table medications enable row level security;
alter table medication_schedules enable row level security;
alter table medication_events enable row level security;
alter table push_subscriptions enable row level security;
alter table chat_messages enable row level security;
alter table checkins enable row level security;
alter table doctor_directory enable row level security;
alter table usage_logs enable row level security;
alter table risk_events enable row level security;

-- App uses server-side service role APIs. These RLS policies support optional direct reads if needed.
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "own payments" on payment_requests;
create policy "own payments" on payment_requests for select using (auth.uid() = user_id);
drop policy if exists "own reports" on reports;
create policy "own reports" on reports for select using (auth.uid() = user_id);
drop policy if exists "own meds" on medications;
create policy "own meds" on medications for select using (auth.uid() = user_id);
drop policy if exists "own schedules" on medication_schedules;
create policy "own schedules" on medication_schedules for select using (auth.uid() = user_id);
drop policy if exists "own events" on medication_events;
create policy "own events" on medication_events for select using (auth.uid() = user_id);
drop policy if exists "own chats" on chat_messages;
create policy "own chats" on chat_messages for select using (auth.uid() = user_id);
drop policy if exists "public verified doctors" on doctor_directory;
create policy "public verified doctors" on doctor_directory for select using (verified = true);

insert into doctor_directory(name,specialty,clinic,city,area,phone,address,source_url,verified) values
('Dhaka Medical College Hospital','Emergency Medicine','DMCH','Dhaka','Bakshibazar','02-55165088','Secretariat Road, Dhaka','https://dmc.gov.bd/',true),
('National Institute of Cardiovascular Diseases','Cardiology','NICVD','Dhaka','Sher-e-Bangla Nagar','02-9122560','Sher-e-Bangla Nagar, Dhaka','https://nicvd.gov.bd/',true),
('Bangabandhu Sheikh Mujib Medical University','Multi-specialty','BSMMU','Dhaka','Shahbag','09611677777','Shahbag, Dhaka','https://bsmmu.ac.bd/',true)
on conflict do nothing;
