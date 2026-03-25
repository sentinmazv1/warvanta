-- WARVANTA Phase 2 Schema Updates

-- 1. Organizations & Branding
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Departments Enhancements
-- Add manager_id to departments to identify who approves things for that department
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Personnel Enhancements
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Tasks Enhancements (Department-based)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- 5. Asset Logs (Zimmet Geçmişi)
CREATE TABLE IF NOT EXISTS public.asset_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- ASSIGNED, RETURNED, REPAIRED, LOST
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Report Configurations
CREATE TABLE IF NOT EXISTS public.report_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query_config JSONB NOT NULL,
    schedule_cron TEXT, -- e.g. '0 9 * * *' for 9 AM every day
    recipient_emails TEXT[], -- array of emails
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Notes (Defter)
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- RLS ENABLING
ALTER TABLE public.asset_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Company users can view asset logs" ON public.asset_logs
    FOR SELECT USING (asset_id IN (SELECT id FROM public.assets WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Company admins can manage report configs" ON public.report_configs
    FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'COMPANY_ADMIN'));

CREATE POLICY "Users can manage their own notes" ON public.user_notes
    FOR ALL USING (profile_id = auth.uid());
