-- WARVANTA - Departman Yönetimi Yetki Düzelme (RLS)
-- Bu SQL kodunu Supabase Dashboard > SQL Editor kısmında çalıştırın.

-- 1. RLS'i aktif et
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 2. Eski politikaları temizle (varsa)
DROP POLICY IF EXISTS "Company admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Company users can view departments" ON public.departments;

-- 3. Şirket yöneticilerine (COMPANY_ADMIN) tam yetki ver
CREATE POLICY "Company admins can manage departments" ON public.departments
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'COMPANY_ADMIN'
        )
    );

-- 4. Tüm şirket çalışanlarına görüntüleme yetki ver
CREATE POLICY "Company users can view departments" ON public.departments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );
