-- WARVANTA - RBAC & Geofencing Schema Updates

-- 1. Şirket Konum Bilgileri (Geofencing için)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS radius_meters INTEGER DEFAULT 200;

-- 2. Mevcut PUANTAJ tablosu için RLS eklemeleri (Eksikse)
-- Şirket yöneticileri tüm personelin puantajını görebilir
DROP POLICY IF EXISTS "Admins can view all company attendance" ON public.attendance_logs;
CREATE POLICY "Admins can view all company attendance" ON public.attendance_logs
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('COMPANY_ADMIN', 'HR_MANAGER')
        )
    );
