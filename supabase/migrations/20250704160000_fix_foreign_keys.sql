-- Fix foreign key constraints to add CASCADE DELETE behavior
-- This migration updates the foreign key constraints to automatically delete related records

-- Drop existing foreign key constraints
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_bill_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_tenant_id_fkey;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_tenant_id_fkey;
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_tenant_id_fkey;

-- Recreate foreign key constraints with CASCADE DELETE
ALTER TABLE payments 
ADD CONSTRAINT payments_bill_id_fkey 
FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE;

ALTER TABLE payments 
ADD CONSTRAINT payments_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE bills 
ADD CONSTRAINT bills_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE rooms 
ADD CONSTRAINT rooms_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- Add delete policies for bills and payments
CREATE POLICY "Users can delete bills"
  ON bills FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete tenants"
  ON tenants FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (true); 