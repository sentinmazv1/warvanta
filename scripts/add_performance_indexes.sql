-- Performance Optimization Indexes for Warwanta
-- Run these in your Supabase SQL Editor

-- 1. Puantaj Records: Speed up date-range and company-based filtering
CREATE INDEX IF NOT EXISTS idx_puantaj_company_date ON public.puantaj_records(company_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_puantaj_employee ON public.puantaj_records(employee_id);

-- 2. Leaves: Speed up status and company-based filtering
CREATE INDEX IF NOT EXISTS idx_leaves_company_status ON public.leaves(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON public.leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON public.leaves(start_date, end_date);

-- 3. Employees: Speed up company-based lookups
CREATE INDEX IF NOT EXISTS idx_employees_company_status ON public.employees(company_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_profile ON public.employees(profile_id);

-- 4. Profiles: Speed up session-based company lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);

-- 5. Attendance Logs (Giriş/Çıkış): Speed up time-based queries
CREATE INDEX IF NOT EXISTS idx_attendance_logs_company_date ON public.attendance_logs(company_id, created_at);
