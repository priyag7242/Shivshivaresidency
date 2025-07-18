/*
  # Sample Data for PG Management System

  1. Sample Data
    - Insert sample rooms
    - Insert sample tenants
    - Insert sample bills
    - Insert sample payments
    - Insert sample expenses

  2. Notes
    - This is for demo purposes
    - Real deployment should not include this migration
*/

-- Insert sample rooms
INSERT INTO rooms (room_number, floor, room_type, capacity, rent_amount, status) VALUES
('101', 1, 'single', 1, 8000, 'vacant'),
('102', 1, 'single', 1, 7000, 'vacant'),
('103', 1, 'double', 2, 6000, 'vacant'),
('104', 1, 'double', 2, 6000, 'vacant'),
('201', 2, 'triple', 3, 5000, 'vacant'),
('202', 2, 'triple', 3, 5000, 'vacant'),
('203', 2, 'quad', 4, 4500, 'maintenance'),
('204', 2, 'quad', 4, 4500, 'vacant');

-- Insert sample tenants
INSERT INTO tenants (name, mobile, room_number, joining_date, monthly_rent, security_deposit, electricity_joining_reading, status) VALUES
('Rajesh Kumar', '9876543210', '101', '2024-01-15', 8000, 8000, 1250, 'active'),
('Priya Sharma', '9876543211', '102', '2024-02-01', 7000, 7000, 890, 'active'),
('Amit Patel', '9876543212', '201', '2024-01-20', 5000, 0, 2100, 'active');

-- Update rooms to occupied for active tenants
UPDATE rooms SET status = 'occupied', tenant_id = (SELECT id FROM tenants WHERE room_number = '101') WHERE room_number = '101';
UPDATE rooms SET status = 'occupied', tenant_id = (SELECT id FROM tenants WHERE room_number = '102') WHERE room_number = '102';
UPDATE rooms SET status = 'occupied', tenant_id = (SELECT id FROM tenants WHERE room_number = '201') WHERE room_number = '201';

-- Update tenants with last electricity reading
UPDATE tenants SET last_electricity_reading = 1380 WHERE room_number = '101';
UPDATE tenants SET last_electricity_reading = 1020 WHERE room_number = '102';
UPDATE tenants SET last_electricity_reading = 2250 WHERE room_number = '201';

-- Insert sample bills
INSERT INTO bills (tenant_id, billing_period, electricity_reading, rent_amount, electricity_charges, adjustments, total_amount, bill_date, due_date, payment_status, payment_date, payment_method) VALUES
((SELECT id FROM tenants WHERE room_number = '101'), '2024-03', 1380, 8000, 1560, 0, 9560, '2024-03-01', '2024-03-10', 'paid', '2024-03-05', 'upi'),
((SELECT id FROM tenants WHERE room_number = '102'), '2024-03', 1020, 7000, 1560, 0, 8560, '2024-03-01', '2024-03-10', 'unpaid', null, null),
((SELECT id FROM tenants WHERE room_number = '201'), '2024-03', 2250, 5000, 1800, 0, 6800, '2024-03-01', '2024-03-10', 'partial', null, null);

-- Insert sample payments
INSERT INTO payments (bill_id, tenant_id, payment_amount, payment_date, payment_method, payment_status, receipt_sent, notes) VALUES
((SELECT id FROM bills WHERE tenant_id = (SELECT id FROM tenants WHERE room_number = '101') AND billing_period = '2024-03'), (SELECT id FROM tenants WHERE room_number = '101'), 9560, '2024-03-05', 'upi', 'completed', true, 'GPay payment'),
((SELECT id FROM bills WHERE tenant_id = (SELECT id FROM tenants WHERE room_number = '201') AND billing_period = '2024-03'), (SELECT id FROM tenants WHERE room_number = '201'), 4000, '2024-03-08', 'cash', 'completed', false, 'Partial payment');

-- Insert sample expenses
INSERT INTO expenses (date, category, description, amount, payment_method) VALUES
('2024-03-01', 'Maintenance & Repairs', 'Plumbing repair in Room 103', 1500, 'cash'),
('2024-03-05', 'Utilities', 'Internet bill for March', 2000, 'online'),
('2024-03-10', 'Cleaning Supplies', 'Cleaning materials purchase', 800, 'cash'),
('2024-03-15', 'Security Services', 'Security guard salary', 5000, 'bank_transfer'),
('2024-03-20', 'Food & Groceries', 'Kitchen supplies', 1200, 'cash');