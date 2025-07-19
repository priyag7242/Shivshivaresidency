-- =====================================================
-- ELECTRICITY BILLING SYSTEM SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create electricity_readings table
CREATE TABLE IF NOT EXISTS electricity_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    current_reading INTEGER NOT NULL,
    last_reading INTEGER,
    reading_date DATE NOT NULL,
    units_consumed INTEGER DEFAULT 0,
    amount DECIMAL(10,2) DEFAULT 0,
    is_billed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_electricity_readings_room_date 
ON electricity_readings(room_number, reading_date);

-- Enable RLS
ALTER TABLE electricity_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON electricity_readings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON electricity_readings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON electricity_readings
    FOR UPDATE USING (true);

-- Create function to automatically calculate units and amount
CREATE OR REPLACE FUNCTION calculate_electricity_bill()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate units consumed
    IF NEW.last_reading IS NOT NULL THEN
        NEW.units_consumed := NEW.current_reading - NEW.last_reading;
    ELSE
        NEW.units_consumed := 0;
    END IF;
    
    -- Calculate amount (₹12 per unit)
    NEW.amount := NEW.units_consumed * 12;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate bill
CREATE TRIGGER trigger_calculate_electricity_bill
    BEFORE INSERT OR UPDATE ON electricity_readings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_electricity_bill();

-- Create view for electricity dashboard stats
CREATE OR REPLACE VIEW electricity_stats_view AS
SELECT 
    COUNT(*) as total_readings,
    SUM(units_consumed) as total_units,
    SUM(amount) as total_amount,
    SUM(CASE WHEN is_billed THEN amount ELSE 0 END) as collected_amount,
    SUM(CASE WHEN NOT is_billed THEN amount ELSE 0 END) as pending_amount,
    COUNT(CASE WHEN reading_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as current_month_readings,
    SUM(CASE WHEN reading_date >= DATE_TRUNC('month', CURRENT_DATE) THEN units_consumed ELSE 0 END) as current_month_units,
    SUM(CASE WHEN reading_date >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END) as current_month_amount
FROM electricity_readings;

-- Insert sample data (optional - for testing)
INSERT INTO electricity_readings (room_number, tenant_name, current_reading, reading_date, is_billed) VALUES
('101', 'DAISY KRISHANA', 1250, CURRENT_DATE, false),
('102', 'SAKSHAM AGRWAL', 890, CURRENT_DATE, false),
('102', 'SATYAM', 890, CURRENT_DATE, false),
('103', 'KAUSTAV GHOSH', 1120, CURRENT_DATE, false),
('104', 'NIPUN TANK', 1560, CURRENT_DATE, false),
('105', 'DOLLY', 1340, CURRENT_DATE, false),
('106', 'VIJEET NIGAM', 980, CURRENT_DATE, false),
('107', 'SHIV NANDAN', 1100, CURRENT_DATE, false),
('107', 'SIDHANT SETHI', 1100, CURRENT_DATE, false),
('108', 'SUMAN DAS', 1450, CURRENT_DATE, false),
('109', 'ANIL SINGLA', 920, CURRENT_DATE, false),
('110', 'VACANT', 0, CURRENT_DATE, false),
('111', 'ARYAN', 1280, CURRENT_DATE, false),
('111', 'PRANJAL TARIYAL', 1280, CURRENT_DATE, false),
('112', 'PRIYANSH', 1380, CURRENT_DATE, false),
('113', 'PRACHI', 1150, CURRENT_DATE, false),
('113', 'D.R KRISHNA', 1150, CURRENT_DATE, false),
('114', 'ANISH KUMAR', 1620, CURRENT_DATE, false),
('115', 'DHANAJAY GAUR', 1480, CURRENT_DATE, false),
('116', 'SARTHAK KUMAR', 1320, CURRENT_DATE, false),
('116', 'TANUJA RAJE', 1320, CURRENT_DATE, false),
('116', 'MAIMA GARG', 1320, CURRENT_DATE, false),
('117', 'DESIGANAR', 1080, CURRENT_DATE, false),
('117', 'VISHAL M', 1080, CURRENT_DATE, false),
('117', 'ANIKET', 1080, CURRENT_DATE, false),
('118', 'VACANT', 0, CURRENT_DATE, false),
('119', 'POOJA KUMARI', 1750, CURRENT_DATE, false),
('120', 'VACANT', 0, CURRENT_DATE, false);

-- Grant permissions
GRANT ALL ON electricity_readings TO authenticated;
GRANT ALL ON electricity_stats_view TO authenticated; 