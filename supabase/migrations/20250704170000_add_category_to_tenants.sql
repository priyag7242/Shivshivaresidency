-- Add category column to tenants table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'category') THEN
        ALTER TABLE tenants ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to tenants table';
    ELSE
        RAISE NOTICE 'Category column already exists in tenants table';
    END IF;
END $$;

-- Add check constraint (if it doesn't exist)
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

-- Add comment to explain the category field (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_description 
                   WHERE objoid = (SELECT oid FROM pg_class WHERE relname = 'tenants') 
                   AND objsubid = (SELECT attnum FROM pg_attribute 
                                  WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = 'tenants') 
                                  AND attname = 'category')) THEN
        COMMENT ON COLUMN tenants.category IS 'Tenant category: new (New Joinee), existing (Existing Customer), no_security (No Security)';
        RAISE NOTICE 'Added comment to category column';
    ELSE
        RAISE NOTICE 'Comment already exists on category column';
    END IF;
END $$; 