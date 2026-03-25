-- WARVANTA: Multi-Tenant HR & Personnel Management System
-- Database Schema for Supabase (PostgreSQL)

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- Companies Table
create table if not exists public.companies (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    tax_no text,
    address text,
    logo_url text,
    settings jsonb default '{"work_days": [1,2,3,4,5], "work_start": "09:00", "work_end": "18:00", "late_tolerance_min": 15, "overtime_multiplier": 1.5}'::jsonb,
    created_at timestamp with time zone default now()
);

-- Profiles Table (linked to auth.users)
-- We use a custom 'role' column
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    company_id uuid references public.companies(id),
    email text not null,
    first_name text,
    last_name text,
    phone text,
    avatar_url text,
    role text not null check (role in ('SUPERADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')),
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- Departments
create table if not exists public.departments (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default now()
);

-- Positions
create table if not exists public.positions (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default now()
);

-- Branches (needed for GPS/Geofencing)
create table if not exists public.branches (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    name text not null,
    latitude double precision,
    longitude double precision,
    radius_meters integer default 200,
    created_at timestamp with time zone default now()
);

-- Employees (The core personnel record)
create table if not exists public.employees (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete set null,
    tc_no text unique,
    first_name text not null,
    last_name text not null,
    birth_date date,
    hire_date date default current_date,
    termination_date date,
    department_id uuid references public.departments(id),
    position_id uuid references public.positions(id),
    branch_id uuid references public.branches(id),
    base_salary decimal(12,2) default 0,
    status text default 'ACTIVE' check (status in ('ACTIVE', 'PASSIVE')),
    custom_fields jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now()
);

-- Attendance (Clock-in / Clock-out)
create table if not exists public.attendance (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    employee_id uuid not null references public.employees(id) on delete cascade,
    date date default current_date,
    check_in timestamp with time zone,
    check_out timestamp with time zone,
    lat_in double precision,
    lng_in double precision,
    lat_out double precision,
    lng_out double precision,
    status text default 'PRESENT',
    overtime_hours decimal(5,2) default 0,
    created_at timestamp with time zone default now()
);

-- Leaves
create table if not exists public.leaves (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    employee_id uuid not null references public.employees(id) on delete cascade,
    leave_type text not null,
    start_date date not null,
    end_date date not null,
    day_count decimal(5,1),
    reason text,
    status text default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by uuid references public.profiles(id),
    created_at timestamp with time zone default now()
);

-- Assets (Zimmet)
create table if not exists public.assets (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    employee_id uuid references public.employees(id) on delete set null,
    name text not null,
    type text,
    serial_no text,
    issue_date date,
    return_date date,
    condition text,
    created_at timestamp with time zone default now()
);

-- Documents
create table if not exists public.documents (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.companies(id) on delete cascade,
    employee_id uuid not null references public.employees(id) on delete cascade,
    name text not null,
    file_url text not null,
    expiry_date date,
    category text,
    created_at timestamp with time zone default now()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.positions enable row level security;
alter table public.branches enable row level security;
alter table public.employees enable row level security;
alter table public.attendance enable row level security;
alter table public.leaves enable row level security;
alter table public.assets enable row level security;
alter table public.documents enable row level security;

-- 4. POLICIES (Simplified for multi-tenancy)
-- Note: These policies assume we store 'company_id' in auth.users app_metadata or check current user's profile.

-- Example Profile Policy: Users can see profiles in their own company
create policy "Users can view profiles in their company"
on public.profiles for select
using ( company_id = (select company_id from public.profiles where id = auth.uid()) );

-- Employees Policy
create policy "Users can view employees in their company"
on public.employees for select
using ( company_id = (select company_id from public.profiles where id = auth.uid()) );

-- (Similar policies would be applied to all other tables)

-- 5. FUNCTIONS

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role, is_active)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'EMPLOYEE', true);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users signup
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();


-- Company Applications Table
CREATE TABLE company_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  employee_count_range TEXT,
  sector TEXT,
  notes TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id)
);

ALTER TABLE company_applications ENABLE ROW LEVEL SECURITY;

-- Only admins can see applications
CREATE POLICY admin_see_applications ON company_applications
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SYSTEM_ADMIN'));


-- EAV Engine: Custom Fields
CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- TEXT, NUMBER, DATE, SELECT
  options JSONB, -- For SELECT type
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  field_definition_id UUID REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, field_definition_id)
);

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_see_definitions ON custom_field_definitions
  FOR SELECT USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Only company admins can manage definitions
CREATE POLICY admin_manage_definitions ON custom_field_definitions
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'COMPANY_ADMIN')
  );

CREATE POLICY company_see_field_values ON custom_field_values
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY admin_manage_field_values ON custom_field_values
  FOR ALL USING (
    employee_id IN (SELECT id FROM employees WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );


-- CRM & Tasks Module
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  creator_id UUID REFERENCES profiles(id),
  assignee_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO', -- TODO, IN_PROGRESS, DONE, CANCELLED
  priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE visitor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  visitor_name TEXT NOT NULL,
  visitor_company TEXT,
  vehicle_plate TEXT,
  purpose TEXT,
  host_id UUID REFERENCES profiles(id),
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Tasks visibility: everyone in company can see/create
CREATE POLICY company_tasks_policy ON tasks
  FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Visitor logs: everyone in company can see
CREATE POLICY company_visitor_policy ON visitor_logs
  FOR ALL USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
