-- Remove food_amount column from tenants table
-- This migration removes the food_amount field since it's no longer needed

-- Drop the food_amount column
ALTER TABLE tenants DROP COLUMN IF EXISTS food_amount;

-- Keep has_food column for food service tracking
-- has_food remains as a boolean field to track if tenant has food service 