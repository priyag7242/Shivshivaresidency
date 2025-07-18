-- Add food-related fields to tenants table
-- This migration adds support for food service tracking

-- Add has_food and food_amount columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS has_food BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS food_amount DECIMAL(10,2) DEFAULT 0;

-- Update existing tenants to have default values
UPDATE tenants 
SET has_food = false, food_amount = 0 
WHERE has_food IS NULL OR food_amount IS NULL;

-- Add comment to explain the new fields
COMMENT ON COLUMN tenants.has_food IS 'Whether the tenant has opted for food service';
COMMENT ON COLUMN tenants.food_amount IS 'Monthly food amount in rupees'; 