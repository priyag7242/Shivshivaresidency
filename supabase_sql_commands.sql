-- =====================================================
-- PG MANAGEMENT SYSTEM - COMPLETE DATA UPDATE SCRIPT
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Temporarily disable RLS for tenants table
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Step 1.5: Update the status check constraint to allow all status types
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_status_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_status_check 
CHECK (status IN ('active', 'inactive', 'paid', 'due', 'adjust', 'departing', 'left', 'pending', 'terminated', 'hold', 'prospective'));

-- Step 1.6: Update the stay_duration check constraint to allow all duration types
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_stay_duration_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_stay_duration_check 
CHECK (stay_duration IN ('1', '2', '3', '6', 'unknown', '1_month', '2_months', '3_months', '6_months', 'indefinite'));

-- Step 2: Clear existing data (in correct order to avoid foreign key violations)
DELETE FROM payments;
DELETE FROM bills;
DELETE FROM rooms;
DELETE FROM expenses;
DELETE FROM tenants;

-- Step 3: Insert comprehensive tenant data (original 75 + new 40+ tenants)
INSERT INTO tenants (room_number, joining_date, name, monthly_rent, security_deposit, mobile, status, electricity_joining_reading, created_date) VALUES
-- Original 75 tenants
('113', '2021-11-01', 'PRACHI', 10200, 4950, '9454510749', 'active', 0, CURRENT_DATE),
('309', '2025-02-01', 'AMAN SRIVATAV', 15500, 15500, '7651941049', 'active', 0, CURRENT_DATE),
('113', '2021-11-01', 'D.R KRISHNA', 10200, 10200, '8397094046', 'active', 0, CURRENT_DATE),
('202', '2023-05-01', 'SHAIL', 6200, 8500, '7082634926', 'active', 0, CURRENT_DATE),
('205', '2021-11-01', 'MEGHA', 14000, 14000, '9773934690', 'active', 0, CURRENT_DATE),
('211', '2024-05-01', 'ABISHEK SINGH', 16000, 16000, '7499084227', 'active', 0, CURRENT_DATE),
('303', '2023-09-01', 'CHIRAG BANSAL', 6500, 9900, '9996718848', 'active', 0, CURRENT_DATE),
('310', '2022-11-01', 'KARTIK TAYAL', 13200, 15500, '8587975954', 'active', 0, CURRENT_DATE),
('408', '2023-12-01', 'VIKASH VARMA', 13500, 15500, '9045360168', 'active', 0, CURRENT_DATE),
('413', '2023-05-01', 'ASWAS GANGULY', 15000, 15000, '9051070815', 'active', 0, CURRENT_DATE),
('119', '2025-02-01', 'POOJA KUMARI', 17000, 17000, '8529581175', 'active', 0, CURRENT_DATE),
('306', '2024-01-01', 'HIMANSHU', 15500, 15500, '8809952265', 'active', 0, CURRENT_DATE),
('106', '2024-01-01', 'VIJEET NIGAM', 15500, 15500, '9408906385', 'active', 0, CURRENT_DATE),
('401', '2024-01-01', 'ROHIT SENWER', 6200, 6200, '8318136798', 'active', 0, CURRENT_DATE),
('401', '2024-01-01', 'CHETAN PANT', 6500, 6500, '9528892298', 'active', 0, CURRENT_DATE),
('101', '2024-01-01', 'DAISY KRISHANA', 8500, 8500, '9588172468', 'active', 0, CURRENT_DATE),
('206', '2024-01-01', 'PRIYANSHI', 13200, 0, '9410216649', 'active', 0, CURRENT_DATE),
('210', '2024-01-01', 'SRI KRISHANA', 16200, 16200, '8056701270', 'active', 0, CURRENT_DATE),
('217', '2024-01-01', 'SHIVAM VARMA', 6200, 8900, '7895160566', 'active', 0, CURRENT_DATE),
('404', '2024-01-01', 'ASHISH PRATHAP', 15300, 15300, '9997471023', 'active', 0, CURRENT_DATE),
('117', '2024-01-01', 'DESIGANAR', 9200, 4500, '7092098767', 'active', 0, CURRENT_DATE),
('116', '2025-06-01', 'SARTHAK KUMAR', 16500, 16500, '9026827765', 'active', 0, CURRENT_DATE),
('107', '2025-01-01', 'SHIV NANDAN', 10000, 0, '8429721303', 'active', 0, CURRENT_DATE),
('203', '2025-06-02', 'HARSHITA NEGI', 8500, 1000, '9193708466', 'active', 0, CURRENT_DATE),
('307', '2025-06-02', 'PRIYA CHAUBEY', 15500, 0, '8707662459', 'active', 0, CURRENT_DATE),
('203', '2025-06-02', 'SHIV NANDAN', 8500, 1000, '7818014291', 'active', 0, CURRENT_DATE),
('304', '2024-03-01', 'ANKIT CHOUDHARY', 15000, 14000, '9113770092', 'active', 0, CURRENT_DATE),
('207', '2025-01-30', 'ADITYA', 8000, 0, '7900465446', 'active', 0, CURRENT_DATE),
('201', '2024-04-01', 'DHRITI SHARMA', 8500, 0, '7017288218', 'active', 0, CURRENT_DATE),
('102', '2025-04-01', 'SAKSHAM AGRWAL', 8000, 8000, '8090507158', 'active', 0, CURRENT_DATE),
('102', '2025-04-01', 'SATYAM', 8000, 8000, '8863049944', 'active', 0, CURRENT_DATE),
('302', '2025-06-01', 'HIMANSHU', 8000, 8000, '9467777922', 'active', 0, CURRENT_DATE),
('302', '2025-06-01', 'RISHABH', 8000, 8000, '9467777922', 'active', 0, CURRENT_DATE),
('302', '2025-06-01', 'DEVENDER', 8000, 8000, '9467777922', 'active', 0, CURRENT_DATE),
('418', '2025-07-01', 'SHAGUN', 8000, 1000, '9319422504', 'active', 0, CURRENT_DATE),
('209', '2025-02-01', 'HARSHIT KUMAR', 15000, 15000, '6394220519', 'active', 0, CURRENT_DATE),
('402', '2024-01-02', 'PARSHANT', 8500, 4000, '8423270648', 'active', 0, CURRENT_DATE),
('204', '2024-02-06', 'RASHI GUPTA', 10500, 10500, '6387204040', 'active', 0, CURRENT_DATE),
('411', '2025-02-07', 'DIVYANSH', 10000, 0, '8445774367', 'active', 0, CURRENT_DATE),
('402', '2025-02-07', 'PANKAJ KUMAR', 8500, 8500, '7033397085', 'active', 0, CURRENT_DATE),
('401', '2022-12-03', 'NIKIL', 6200, 8900, '8299415220', 'active', 0, CURRENT_DATE),
('403', '2025-05-04', 'ARYAN', 9500, 4750, '7084015303', 'active', 0, CURRENT_DATE),
('403', '2025-05-04', 'AISHWARYA', 9500, 4750, '7084015303', 'active', 0, CURRENT_DATE),
('318', '2025-07-04', 'ARYAN GOYAL', 8000, 8000, '6367609001', 'active', 0, CURRENT_DATE),
('305', '2025-07-04', 'AKSNKSHA UP', 16000, 4000, '8800170768', 'active', 0, CURRENT_DATE),
('417', '2025-07-04', 'SHIVANI SINGH', 8000, 0, '8349425617', 'active', 0, CURRENT_DATE),
('214', '2025-05-02', 'RAHUL RANGAR', 10000, 10000, '9760187038', 'active', 0, CURRENT_DATE),
('103', '2025-05-01', 'KAUSTAV GHOSH', 10500, 10500, '7980414688', 'active', 0, CURRENT_DATE),
('303', '2024-05-01', 'PRADYUM', 8500, 9500, '9761019937', 'active', 0, CURRENT_DATE),
('313', '2024-05-08', 'PADMINI KUMARI', 8500, 8500, '8789162932', 'active', 0, CURRENT_DATE),
('204', '2025-05-07', 'ARUSHI', 9500, 9500, '7903424548', 'active', 0, CURRENT_DATE),
('417', '2025-05-07', 'MEENAKSHI TIWARI', 8000, 2000, '9670025539', 'active', 0, CURRENT_DATE),
('414', '2023-05-11', 'BHRIGU PANT', 13500, 13500, '999767333', 'active', 0, CURRENT_DATE),
('419', '2024-06-02', 'SHRESTH GAHLOT', 10500, 0, '9785616505', 'active', 0, CURRENT_DATE),
('107', '2025-06-06', 'SIDHANT SETHI', 9500, 4750, '9717827627', 'active', 0, CURRENT_DATE),
('312', '2024-10-06', 'ANISH KUMAR', 15000, 0, '7309016666', 'active', 0, CURRENT_DATE),
('418', '2025-06-07', 'KHUSHI VARMA', 8200, 2000, '8081569878', 'active', 0, CURRENT_DATE),
('114', '2025-01-07', 'ANISH KUMAR', 16200, 16200, '9546257643', 'active', 0, CURRENT_DATE),
('301', '2025-08-05', 'NITU TIWARI', 7500, 7500, '9140731851', 'active', 0, CURRENT_DATE),
('111', '2024-08-10', 'ARYAN', 9500, 4750, '8708407492', 'active', 0, CURRENT_DATE),
('111', '2024-08-10', 'PRANJAL TARIYAL', 9500, 4750, '9193375623', 'active', 0, CURRENT_DATE),
('218', '2023-09-08', 'PRIYA BHATT', 8000, 6500, '9555069116', 'active', 0, CURRENT_DATE),
('116', '2023-09-08', 'TANUJA RAJE', 8000, 8000, '8869960442', 'active', 0, CURRENT_DATE),
('416', '2023-09-08', 'VAISHNAVI', 13500, 15500, '9354050289', 'active', 0, CURRENT_DATE),
('502', '2025-09-06', 'HARSH VARMA', 9000, 5000, '9340375798', 'active', 0, CURRENT_DATE),
('219', '2025-09-07', 'AMAN SINGH', 8500, 0, '6388699606', 'active', 0, CURRENT_DATE),
('318', '2025-09-06', 'VIVEK', 6500, 0, '9669667277', 'active', 0, CURRENT_DATE),
('501', '2024-09-01', 'RISHABH', 15300, 16500, '9431495295', 'active', 0, CURRENT_DATE),
('217', '2024-05-10', 'SAGAR SINGH', 8000, 8000, '9510933750', 'active', 0, CURRENT_DATE),
('116', '2023-10-03', 'MAIMA GARG', 8000, 8000, '7017257053', 'active', 0, CURRENT_DATE),
('218', '2025-10-04', 'MUSKAN', 7500, 9500, '7303575456', 'active', 0, CURRENT_DATE),
('419', '2025-10-06', 'JOYATI', 10500, 10500, '7908019023', 'active', 0, CURRENT_DATE),
('419', '2025-06-10', 'TANPREET KAUR', 10500, 10500, '8400758058', 'active', 0, CURRENT_DATE),
('412', '2025-06-10', 'AMANDEEP SINGH', 14500, 14500, '9717558165', 'active', 0, CURRENT_DATE),
('418', '2025-06-10', 'AL TANZEEN KHAN', 8000, 2000, '8529085729', 'active', 0, CURRENT_DATE),

-- New additional tenants
('301', '2024-09-21', 'SONAM CHOUDHARY', 6500, 0, '7037262167', 'active', 0, CURRENT_DATE),
('301', '2025-06-21', 'SIDHANT SHARMA', 15000, 15000, '8550043773', 'active', 0, CURRENT_DATE),
('217', '2025-02-21', 'AVINESH KUMAR', 8000, 8000, '9306442318', 'active', 0, CURRENT_DATE),
('405', '2025-03-22', 'MOHIT KUMAR', 16000, 8000, '7454933124', 'active', 0, CURRENT_DATE),
('213', '2025-05-25', 'SHUBHAM', 15000, 10000, '', 'active', 0, CURRENT_DATE),
('410', '2025-05-25', 'PAYAL', 15000, 0, '', 'active', 0, CURRENT_DATE),
('417', '2025-05-25', 'KIRTIPAL', 9000, 0, '', 'active', 0, CURRENT_DATE),
('115', '2025-02-25', 'DHANAJAY GAUR', 15000, 15000, '9560215335', 'active', 0, CURRENT_DATE),
('219', '2025-06-26', 'JATIN KUMAR', 10000, 5000, '7017371834', 'active', 0, CURRENT_DATE),
('317', '2024-09-26', 'VIKASH TYAGI', 6500, 0, '9634105681', 'active', 0, CURRENT_DATE),
('308', '2024-01-26', 'AMAN', 8500, 4500, '9446627408', 'active', 0, CURRENT_DATE),
('308', '2025-06-29', 'YATI SINGH', 15000, 15000, '8532893952', 'active', 0, CURRENT_DATE),
('314', '2025-03-30', 'PUJA KUMARI', 16000, 16000, '7739830917', 'active', 0, CURRENT_DATE),
('109', '2025-03-31', 'ANIL SINGLA', 9000, 0, '9872811589', 'active', 0, CURRENT_DATE),
('218', '2025-06-30', 'SHAMBHAVI', 8000, 8000, '9304622497', 'active', 0, CURRENT_DATE),
('104', '2025-06-30', 'NIPUN TANK', 16000, 16000, '9462492390', 'active', 0, CURRENT_DATE),
('216', '2025-04-11', 'HARSH VARDAN', 9000, 9000, '', 'adjust', 0, CURRENT_DATE),
('216', '2025-04-11', 'PRACHI VARMA', 9000, 9000, '', 'adjust', 0, CURRENT_DATE),
('207', '2024-01-11', 'RAJEEV SINGH', 8000, 0, '8368535311', 'paid', 0, CURRENT_DATE),
('G001', '2025-06-11', 'ABHAY', 7000, 0, '', 'active', 0, CURRENT_DATE),
('201', '2025-03-11', 'SHIVANGI SAHU', 8200, 0, '7007225230', 'paid', 0, CURRENT_DATE),
('117', '2024-10-12', 'VISHAL M', 9200, 4500, '8870866151', 'active', 0, CURRENT_DATE),
('117', '2024-10-12', 'ANIKET', 7200, 4500, '8870866151', 'active', 0, CURRENT_DATE),
('212', '2025-06-13', 'HEZEL', 15000, 15000, '8571879469', 'adjust', 0, CURRENT_DATE),
('406', '2025-04-13', 'SIDDHART', 15000, 15000, '8721082742', 'paid', 0, CURRENT_DATE),
('108', '2022-11-12', 'SUMAN DAS', 15900, 0, '8448949159', 'paid', 0, CURRENT_DATE),
('201', '2024-03-14', 'PRIYA GOYAL', 7000, 0, '8766344735', 'due', 0, CURRENT_DATE),
('202', '2025-05-14', 'SACHIN RAIKWAR', 8500, 8500, '7705886228', 'active', 0, CURRENT_DATE),
('208', '2025-06-15', 'SHIVAM KUMAR', 9500, 9500, '7483383270', 'active', 0, CURRENT_DATE),
('112', '2025-06-15', 'PRIYANSH', 15000, 15000, '9776319855', 'paid', 0, CURRENT_DATE),
('311', '2024-01-15', 'AKANKSHA SINGH', 8000, 0, '', 'paid', 0, CURRENT_DATE),
('417', '2025-06-16', 'AKANKSHA GUPTHA', 8200, 2000, '8957290074', 'paid', 0, CURRENT_DATE),
('315', '2023-07-16', 'RAVI SHANKAR', 16000, 16000, '89188195019', 'paid', 0, CURRENT_DATE),
('308', '2025-06-16', 'NIKHIL KUMAR', 16000, 16000, '9123885936', 'adjust', 0, CURRENT_DATE),
('415', '2023-02-16', 'AYUSH GOYAL', 12500, 16000, '8826777414', 'paid', 0, CURRENT_DATE),
('214', '2023-09-18', 'KULDEEP CHOUDHARY', 7500, 7500, '9761560469', 'active', 0, CURRENT_DATE),
('301', '2024-10-18', 'ANUSHKA', 6500, 8500, '7985553788', 'active', 0, CURRENT_DATE),
('502', '2025-06-19', 'KARTIK', 9000, 5000, '7985553788', 'adjust', 0, CURRENT_DATE),
('502', '2025-06-19', 'SHAIL SINGH', 9000, 5000, '7985553788', 'adjust', 0, CURRENT_DATE),
('105', '2024-05-20', 'DOLLY', 13000, 13000, '9811933527', 'active', 0, CURRENT_DATE),
('409', '2024-10-20', 'KRISHNA', 16200, 16200, '7240861072', 'active', 0, CURRENT_DATE);

-- Step 4: Create a view for room-wise tenant status
CREATE OR REPLACE VIEW room_status_view AS
SELECT 
    room_number,
    COUNT(*) as total_tenants,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_tenants,
    COUNT(CASE WHEN status = 'due' THEN 1 END) as due_tenants,
    COUNT(CASE WHEN status = 'adjust' THEN 1 END) as adjust_tenants,
    COUNT(CASE WHEN status = 'departing' THEN 1 END) as departing_tenants,
    COUNT(CASE WHEN status = 'left' THEN 1 END) as left_tenants,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tenants,
    COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_tenants,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_tenants,
    COUNT(CASE WHEN status = 'hold' THEN 1 END) as hold_tenants,
    COUNT(CASE WHEN status = 'prospective' THEN 1 END) as prospective_tenants,
    SUM(monthly_rent) as total_rent,
    SUM(security_deposit) as total_deposit,
    CASE 
        WHEN COUNT(*) = 0 THEN 'VACANT'
        WHEN COUNT(CASE WHEN status = 'active' THEN 1 END) > 0 THEN 'OCCUPIED'
        WHEN COUNT(CASE WHEN status = 'paid' THEN 1 END) > 0 THEN 'PAID'
        WHEN COUNT(CASE WHEN status = 'due' THEN 1 END) > 0 THEN 'DUE'
        WHEN COUNT(CASE WHEN status = 'adjust' THEN 1 END) > 0 THEN 'ADJUST'
        WHEN COUNT(CASE WHEN status = 'departing' THEN 1 END) > 0 THEN 'DEPARTING'
        WHEN COUNT(CASE WHEN status = 'left' THEN 1 END) > 0 THEN 'LEFT'
        WHEN COUNT(CASE WHEN status = 'pending' THEN 1 END) > 0 THEN 'PENDING'
        WHEN COUNT(CASE WHEN status = 'terminated' THEN 1 END) > 0 THEN 'TERMINATED'
        WHEN COUNT(CASE WHEN status = 'inactive' THEN 1 END) > 0 THEN 'INACTIVE'
        WHEN COUNT(CASE WHEN status = 'hold' THEN 1 END) > 0 THEN 'HOLD'
        WHEN COUNT(CASE WHEN status = 'prospective' THEN 1 END) > 0 THEN 'PROSPECTIVE'
        ELSE 'UNKNOWN'
    END as room_status
FROM tenants 
GROUP BY room_number
ORDER BY room_number;

-- Step 5: Create a view for vacant rooms
CREATE OR REPLACE VIEW vacant_rooms_view AS
SELECT 
    r.room_number,
    'VACANT' as status,
    0 as total_tenants,
    0 as total_rent,
    0 as total_deposit
FROM (
    SELECT DISTINCT room_number FROM tenants
    UNION
    SELECT '101' UNION SELECT '102' UNION SELECT '103' UNION SELECT '104' UNION SELECT '105' UNION
    SELECT '106' UNION SELECT '107' UNION SELECT '108' UNION SELECT '109' UNION SELECT '110' UNION
    SELECT '111' UNION SELECT '112' UNION SELECT '113' UNION SELECT '114' UNION SELECT '115' UNION
    SELECT '116' UNION SELECT '117' UNION SELECT '118' UNION SELECT '119' UNION SELECT '120' UNION
    SELECT '201' UNION SELECT '202' UNION SELECT '203' UNION SELECT '204' UNION SELECT '205' UNION
    SELECT '206' UNION SELECT '207' UNION SELECT '208' UNION SELECT '209' UNION SELECT '210' UNION
    SELECT '211' UNION SELECT '212' UNION SELECT '213' UNION SELECT '214' UNION SELECT '215' UNION
    SELECT '216' UNION SELECT '217' UNION SELECT '218' UNION SELECT '219' UNION SELECT '220' UNION
    SELECT '301' UNION SELECT '302' UNION SELECT '303' UNION SELECT '304' UNION SELECT '305' UNION
    SELECT '306' UNION SELECT '307' UNION SELECT '308' UNION SELECT '309' UNION SELECT '310' UNION
    SELECT '311' UNION SELECT '312' UNION SELECT '313' UNION SELECT '314' UNION SELECT '315' UNION
    SELECT '316' UNION SELECT '317' UNION SELECT '318' UNION SELECT '319' UNION SELECT '320' UNION
    SELECT '401' UNION SELECT '402' UNION SELECT '403' UNION SELECT '404' UNION SELECT '405' UNION
    SELECT '406' UNION SELECT '407' UNION SELECT '408' UNION SELECT '409' UNION SELECT '410' UNION
    SELECT '411' UNION SELECT '412' UNION SELECT '413' UNION SELECT '414' UNION SELECT '415' UNION
    SELECT '416' UNION SELECT '417' UNION SELECT '418' UNION SELECT '419' UNION SELECT '420' UNION
    SELECT '501' UNION SELECT '502' UNION SELECT '503' UNION SELECT '504' UNION SELECT '505' UNION
    SELECT 'G001' UNION SELECT 'G002' UNION SELECT 'G003'
) r
WHERE r.room_number NOT IN (SELECT DISTINCT room_number FROM tenants WHERE status = 'active');

-- Step 6: Re-enable RLS for tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify the data
SELECT 
    'Data update completed successfully!' as message,
    COUNT(*) as total_tenants,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_tenants,
    COUNT(CASE WHEN status = 'due' THEN 1 END) as due_tenants,
    COUNT(CASE WHEN status = 'adjust' THEN 1 END) as adjust_tenants,
    COUNT(CASE WHEN status = 'departing' THEN 1 END) as departing_tenants,
    COUNT(CASE WHEN status = 'left' THEN 1 END) as left_tenants,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tenants,
    COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_tenants,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_tenants,
    COUNT(CASE WHEN status = 'hold' THEN 1 END) as hold_tenants,
    COUNT(CASE WHEN status = 'prospective' THEN 1 END) as prospective_tenants,
    SUM(monthly_rent) as total_monthly_rent,
    SUM(security_deposit) as total_security_deposit
FROM tenants;

-- Step 8: Show room-wise summary
SELECT * FROM room_status_view ORDER BY room_number;

-- Step 9: Show vacant rooms
SELECT * FROM vacant_rooms_view ORDER BY room_number; 