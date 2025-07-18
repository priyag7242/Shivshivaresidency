-- Simple script to add only the category column
-- This avoids conflicts with existing columns

-- First, let's check if the column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'category') THEN
        -- Add the column
        ALTER TABLE tenants ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to tenants table';
    ELSE
        RAISE NOTICE 'Category column already exists in tenants table';
    END IF;
END $$;

-- Now add check constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'tenants_category_check') THEN
        ALTER TABLE tenants ADD CONSTRAINT tenants_category_check 
        CHECK (category IS NULL OR category IN ('new', 'existing', 'no_security'));
        RAISE NOTICE 'Added category check constraint';
    ELSE
        RAISE NOTICE 'Category check constraint already exists';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN tenants.category IS 'Tenant category: new (New Joinee), existing (Existing Customer), no_security (No Security)';

-- Verify the column was added
SELECT 'Category column status:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'category'; 