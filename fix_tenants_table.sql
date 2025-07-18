-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;

-- Add category column if it doesn't exist
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS category TEXT;

-- Add check constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'tenants_category_check') THEN
        ALTER TABLE tenants ADD CONSTRAINT tenants_category_check 
        CHECK (category IS NULL OR category IN ('new', 'existing', 'no_security'));
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'category'; 