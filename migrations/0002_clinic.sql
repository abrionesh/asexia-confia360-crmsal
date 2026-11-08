create table if not exists clinics (
  id text primary key,
  code text unique not null,
  name text not null
);

create table if not exists clinic_members (
  user_id text primary key,
  clinic_id text not null references clinics (id),
  role text not null,
  doctor_name text
);

create table if not exists clinic_books (
  clinic_id text primary key references clinics (id),
  revision integer not null default 0,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists patient_links (
  token text primary key,
  clinic_id text not null,
  patient_id text not null
);
