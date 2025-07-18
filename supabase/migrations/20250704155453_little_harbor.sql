/*
  # Initial Schema for PG Management System

  1. New Tables
    - `tenants` - Store tenant information
    - `rooms` - Store room details and availability
    - `bills` - Store billing information
    - `payments` - Store payment records
    - `expenses` - Store expense tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  room_number text NOT NULL,
  joining_date date NOT NULL,
  monthly_rent decimal(10,2) NOT NULL DEFAULT 0,
  security_deposit decimal(10,2) NOT NULL DEFAULT 0,
  electricity_joining_reading decimal(10,2) NOT NULL DEFAULT 0,
  last_electricity_reading decimal(10,2),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text UNIQUE NOT NULL,
  floor integer NOT NULL DEFAULT 1,
  room_type text NOT NULL CHECK (room_type IN ('single', 'double', 'triple', 'quad')),
  capacity integer NOT NULL DEFAULT 1,
  rent_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  tenant_id uuid REFERENCES tenants(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  billing_period text NOT NULL,
  electricity_reading decimal(10,2) NOT NULL DEFAULT 0,
  rent_amount decimal(10,2) NOT NULL DEFAULT 0,
  electricity_charges decimal(10,2) NOT NULL DEFAULT 0,
  adjustments decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  bill_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  payment_date date,
  payment_method text CHECK (payment_method IN ('cash', 'online', 'upi', 'bank_transfer', 'cheque')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  payment_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'online', 'upi', 'bank_transfer', 'cheque')),
  payment_status text NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('completed', 'pending')),
  receipt_sent boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  receipt_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read all tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert tenants"
  ON tenants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tenants"
  ON tenants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all bills"
  ON bills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert bills"
  ON bills FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bills"
  ON bills FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_room_number ON tenants(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_bills_tenant_id ON bills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bills_billing_period ON bills(billing_period);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();