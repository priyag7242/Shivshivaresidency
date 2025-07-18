-- Add departure tracking fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS departure_date date,
ADD COLUMN IF NOT EXISTS stay_duration text CHECK (stay_duration IN ('1_month', '2_months', '3_months', '6_months', 'indefinite')),
ADD COLUMN IF NOT EXISTS notice_given boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notice_date date,
ADD COLUMN IF NOT EXISTS security_adjustment numeric(10,2) DEFAULT 0;

-- Add index for departure date queries
CREATE INDEX IF NOT EXISTS idx_tenants_departure_date ON tenants(departure_date);
CREATE INDEX IF NOT EXISTS idx_tenants_stay_duration ON tenants(stay_duration);
CREATE INDEX IF NOT EXISTS idx_tenants_notice_given ON tenants(notice_given);
CREATE INDEX IF NOT EXISTS idx_tenants_security_adjustment ON tenants(security_adjustment);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Users can update tenants" ON tenants;
CREATE POLICY "Users can update tenants"
  ON tenants FOR UPDATE
  TO authenticated
  USING (true); 