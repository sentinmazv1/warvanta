
-- Add subscription and status fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS subscription_start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_period TEXT, -- '6_MONTHS', '1_YEAR', '2_YEARS', '3_YEARS'
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'PENDING_RENEWAL')),
ADD COLUMN IF NOT EXISTS data_usage_bytes BIGINT DEFAULT 0;

-- Add rejection info to company_applications
ALTER TABLE public.company_applications
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update processed_at automatically if status changes from PENDING
CREATE OR REPLACE FUNCTION update_processed_at_column()
RETURNS TRIGGER AS $$
BEGIN
   IF (OLD.status = 'PENDING' AND NEW.status != 'PENDING') THEN
      NEW.processed_at = NOW();
   END IF;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_company_apps_processed_at ON public.company_applications;
CREATE TRIGGER tr_update_company_apps_processed_at
BEFORE UPDATE ON public.company_applications
FOR EACH ROW EXECUTE PROCEDURE update_processed_at_column();
