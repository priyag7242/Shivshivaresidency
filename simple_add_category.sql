-- Simple script to add category column
-- Run this in your Supabase SQL editor

-- Add the category column
ALTER TABLE tenants ADD COLUMN category TEXT;

-- Add the check constraint
ALTER TABLE tenants ADD CONSTRAINT tenants_category_check 
CHECK (category IS NULL OR category IN ('new', 'existing', 'no_security'));

-- Add a comment
COMMENT ON COLUMN tenants.category IS 'Tenant category: new (New Joinee), existing (Existing Customer), no_security (No Security)';

-- Verify it worked
SELECT 'Category column added successfully!' as status; 