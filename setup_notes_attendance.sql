-- WARVANTA - Notlar ve Puantaj Sorgulama (Tablo Kurulumu)
-- Bu SQL kodunu Supabase Dashboard > SQL Editor kısmında çalıştırın.

-- 1. Kullanıcı Notları (Defter) Tablosu
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Aktif Et
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Politikalar
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.user_notes;
CREATE POLICY "Users can manage their own notes" ON public.user_notes
    FOR ALL USING (profile_id = auth.uid());


-- 2. Puantaj (Attendance) Tablosu
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    check_in_lat DOUBLE PRECISION,
    check_in_lng DOUBLE PRECISION,
    check_out_lat DOUBLE PRECISION,
    check_out_lng DOUBLE PRECISION,
    status TEXT DEFAULT 'PRESENT', -- PRESENT, LATE, OVERTIME, EARLY_EXIT
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Aktif Et
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Politikalar
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.attendance_logs;
CREATE POLICY "Users can manage their own attendance" ON public.attendance_logs
    FOR ALL USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view company attendance" ON public.attendance_logs;
CREATE POLICY "Admins can view company attendance" ON public.attendance_logs
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('COMPANY_ADMIN', 'HR_MANAGER')
        )
    );
