import { supabase } from '../lib/supabase';
import { Tenant, Room, Bill, Payment, Expense } from '../types';

// Tenants
export const tenantsService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_date', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      mobile: tenant.mobile,
      roomNumber: tenant.room_number,
      joiningDate: tenant.joining_date,
      monthlyRent: tenant.monthly_rent,
      securityDeposit: tenant.security_deposit,
      electricityJoiningReading: tenant.electricity_joining_reading,
      lastElectricityReading: tenant.last_electricity_reading,
      status: tenant.status,
      createdDate: tenant.created_date,
      hasFood: tenant.has_food || false,
      category: tenant.category || undefined,
      departureDate: tenant.departure_date,
      stayDuration: tenant.stay_duration,
      noticeGiven: tenant.notice_given || false,
      noticeDate: tenant.notice_date,
      securityAdjustment: tenant.security_adjustment || 0
    }));
  },

  async create(tenant: Omit<Tenant, 'id'>): Promise<Tenant> {
    // Convert camelCase to snake_case for database
    const dbTenant = {
      name: tenant.name,
      mobile: tenant.mobile,
      room_number: tenant.roomNumber,
      joining_date: tenant.joiningDate,
      monthly_rent: tenant.monthlyRent,
      security_deposit: tenant.securityDeposit,
      electricity_joining_reading: tenant.electricityJoiningReading,
      last_electricity_reading: tenant.lastElectricityReading || null,
      status: tenant.status,
      created_date: tenant.createdDate,
      has_food: tenant.hasFood,
      category: tenant.category,
      departure_date: tenant.departureDate,
      stay_duration: tenant.stayDuration,
      notice_given: tenant.noticeGiven || false,
      notice_date: tenant.noticeDate,
      security_adjustment: tenant.securityAdjustment || 0
    };

    const { data, error } = await supabase
      .from('tenants')
      .insert([dbTenant])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      name: data.name,
      mobile: data.mobile,
      roomNumber: data.room_number,
      joiningDate: data.joining_date,
      monthlyRent: data.monthly_rent,
      securityDeposit: data.security_deposit,
      electricityJoiningReading: data.electricity_joining_reading,
      lastElectricityReading: data.last_electricity_reading,
      status: data.status,
      createdDate: data.created_date,
      hasFood: data.has_food || false,
      category: data.category || undefined,
      departureDate: data.departure_date || undefined,
      stayDuration: data.stay_duration || undefined,
      noticeGiven: data.notice_given || false,
      noticeDate: data.notice_date || undefined
    };
  },

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile;
    if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber;
    if (updates.joiningDate !== undefined) dbUpdates.joining_date = updates.joiningDate;
    if (updates.monthlyRent !== undefined) dbUpdates.monthly_rent = updates.monthlyRent;
    if (updates.securityDeposit !== undefined) dbUpdates.security_deposit = updates.securityDeposit;
    if (updates.electricityJoiningReading !== undefined) dbUpdates.electricity_joining_reading = updates.electricityJoiningReading;
    if (updates.lastElectricityReading !== undefined) dbUpdates.last_electricity_reading = updates.lastElectricityReading;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.hasFood !== undefined) dbUpdates.has_food = updates.hasFood;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.departureDate !== undefined) dbUpdates.departure_date = updates.departureDate;
    if (updates.stayDuration !== undefined) dbUpdates.stay_duration = updates.stayDuration;
    if (updates.noticeGiven !== undefined) dbUpdates.notice_given = updates.noticeGiven;
    if (updates.noticeDate !== undefined) dbUpdates.notice_date = updates.noticeDate;
    if (updates.securityAdjustment !== undefined) dbUpdates.security_adjustment = updates.securityAdjustment;

    console.log('Updating tenant with ID:', id);
    console.log('Update data:', dbUpdates);

    const { data, error } = await supabase
      .from('tenants')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Supabase update response:', { data, error });
    if (error) {
      console.error('Database update error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}${error.details ? ` - ${error.details}` : ''}`);
    }
    if (!data) {
      throw new Error('No data returned from Supabase update.');
    }
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      name: data.name,
      mobile: data.mobile,
      roomNumber: data.room_number,
      joiningDate: data.joining_date,
      monthlyRent: data.monthly_rent,
      securityDeposit: data.security_deposit,
      electricityJoiningReading: data.electricity_joining_reading,
      lastElectricityReading: data.last_electricity_reading,
      status: data.status,
      createdDate: data.created_date,
      hasFood: data.has_food || false,
      category: data.category || undefined,
      departureDate: data.departure_date || undefined,
      stayDuration: data.stay_duration || undefined,
      noticeGiven: data.notice_given || false,
      noticeDate: data.notice_date || undefined,
      securityAdjustment: data.security_adjustment || 0
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Rooms
export const roomsService = {
  async getAll(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number');
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(room => ({
      id: room.id,
      roomNumber: room.room_number,
      floor: room.floor,
      roomType: room.room_type,
      capacity: room.capacity,
      rentAmount: room.rent_amount,
      status: room.status,
      tenantId: room.tenant_id
    }));
  },

  async create(room: Omit<Room, 'id'>): Promise<Room> {
    // Convert camelCase to snake_case for database
    const dbRoom = {
      room_number: room.roomNumber,
      floor: room.floor,
      room_type: room.roomType,
      capacity: room.capacity,
      rent_amount: room.rentAmount,
      status: room.status,
      tenant_id: room.tenantId
    };

    const { data, error } = await supabase
      .from('rooms')
      .insert([dbRoom])
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      roomNumber: data.room_number,
      floor: data.floor,
      roomType: data.room_type,
      capacity: data.capacity,
      rentAmount: data.rent_amount,
      status: data.status,
      tenantId: data.tenant_id
    };
  },

  async update(id: string, updates: Partial<Room>): Promise<Room> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber;
    if (updates.floor !== undefined) dbUpdates.floor = updates.floor;
    if (updates.roomType !== undefined) dbUpdates.room_type = updates.roomType;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.rentAmount !== undefined) dbUpdates.rent_amount = updates.rentAmount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.tenantId !== undefined) dbUpdates.tenant_id = updates.tenantId;

    const { data, error } = await supabase
      .from('rooms')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      roomNumber: data.room_number,
      floor: data.floor,
      roomType: data.room_type,
      capacity: data.capacity,
      rentAmount: data.rent_amount,
      status: data.status,
      tenantId: data.tenant_id
    };
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Bills
export const billsService = {
  // Test database connectivity
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test successful');
      return true;
    } catch (err) {
      console.error('Database connection test error:', err);
      return false;
    }
  },

  async getAll(): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('bill_date', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(bill => ({
      id: bill.id,
      tenantId: bill.tenant_id,
      billingPeriod: bill.billing_period,
      electricityReading: bill.electricity_reading,
      rentAmount: bill.rent_amount,
      electricityCharges: bill.electricity_charges,
      adjustments: bill.adjustments,
      totalAmount: bill.total_amount,
      billDate: bill.bill_date,
      paymentStatus: bill.payment_status,
      paymentDate: bill.payment_date,
      paymentMethod: bill.payment_method,
      dueDate: bill.due_date
    }));
  },

  async create(bill: Omit<Bill, 'id'>): Promise<Bill> {
    // Convert camelCase to snake_case for database
    const dbBill = {
      tenant_id: bill.tenantId,
      billing_period: bill.billingPeriod,
      electricity_reading: bill.electricityReading,
      rent_amount: bill.rentAmount,
      electricity_charges: bill.electricityCharges,
      adjustments: bill.adjustments,
      total_amount: bill.totalAmount,
      bill_date: bill.billDate,
      payment_status: bill.paymentStatus,
      payment_date: bill.paymentDate,
      payment_method: bill.paymentMethod,
      due_date: bill.dueDate
    };

    console.log('Creating bill with database data:', dbBill);

    const { data, error } = await supabase
      .from('bills')
      .insert([dbBill])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating bill:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('Bill created successfully in database:', data);
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      tenantId: data.tenant_id,
      billingPeriod: data.billing_period,
      electricityReading: data.electricity_reading,
      rentAmount: data.rent_amount,
      electricityCharges: data.electricity_charges,
      adjustments: data.adjustments,
      totalAmount: data.total_amount,
      billDate: data.bill_date,
      paymentStatus: data.payment_status,
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method,
      dueDate: data.due_date
    };
  },

  async update(id: string, updates: Partial<Bill>): Promise<Bill> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.tenantId !== undefined) dbUpdates.tenant_id = updates.tenantId;
    if (updates.billingPeriod !== undefined) dbUpdates.billing_period = updates.billingPeriod;
    if (updates.electricityReading !== undefined) dbUpdates.electricity_reading = updates.electricityReading;
    if (updates.rentAmount !== undefined) dbUpdates.rent_amount = updates.rentAmount;
    if (updates.electricityCharges !== undefined) dbUpdates.electricity_charges = updates.electricityCharges;
    if (updates.adjustments !== undefined) dbUpdates.adjustments = updates.adjustments;
    if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount;
    if (updates.billDate !== undefined) dbUpdates.bill_date = updates.billDate;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.paymentDate !== undefined) dbUpdates.payment_date = updates.paymentDate;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

    const { data, error } = await supabase
      .from('bills')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      tenantId: data.tenant_id,
      billingPeriod: data.billing_period,
      electricityReading: data.electricity_reading,
      rentAmount: data.rent_amount,
      electricityCharges: data.electricity_charges,
      adjustments: data.adjustments,
      totalAmount: data.total_amount,
      billDate: data.bill_date,
      paymentStatus: data.payment_status,
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method,
      dueDate: data.due_date
    };
  },

  async getByTenant(tenantId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('bill_date', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(bill => ({
      id: bill.id,
      tenantId: bill.tenant_id,
      billingPeriod: bill.billing_period,
      electricityReading: bill.electricity_reading,
      rentAmount: bill.rent_amount,
      electricityCharges: bill.electricity_charges,
      adjustments: bill.adjustments,
      totalAmount: bill.total_amount,
      billDate: bill.bill_date,
      paymentStatus: bill.payment_status,
      paymentDate: bill.payment_date,
      paymentMethod: bill.payment_method,
      dueDate: bill.due_date
    }));
  }
};

// Payments
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(payment => ({
      id: payment.id,
      billId: payment.bill_id,
      tenantId: payment.tenant_id,
      paymentAmount: payment.payment_amount,
      paymentDate: payment.payment_date,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      receiptSent: payment.receipt_sent,
      notes: payment.notes
    }));
  },

  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    // Convert camelCase to snake_case for database
    const dbPayment = {
      bill_id: payment.billId,
      tenant_id: payment.tenantId,
      payment_amount: payment.paymentAmount,
      payment_date: payment.paymentDate,
      payment_method: payment.paymentMethod,
      payment_status: payment.paymentStatus,
      receipt_sent: payment.receiptSent,
      notes: payment.notes
    };

    const { data, error } = await supabase
      .from('payments')
      .insert([dbPayment])
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      billId: data.bill_id,
      tenantId: data.tenant_id,
      paymentAmount: data.payment_amount,
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method,
      paymentStatus: data.payment_status,
      receiptSent: data.receipt_sent,
      notes: data.notes
    };
  },

  async getByBill(billId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('bill_id', billId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(payment => ({
      id: payment.id,
      billId: payment.bill_id,
      tenantId: payment.tenant_id,
      paymentAmount: payment.payment_amount,
      paymentDate: payment.payment_date,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      receiptSent: payment.receipt_sent,
      notes: payment.notes
    }));
  }
};

// Expenses
export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    return (data || []).map(expense => ({
      id: expense.id,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.payment_method,
      receiptUrl: expense.receipt_url
    }));
  },

  async create(expense: Omit<Expense, 'id'>): Promise<Expense> {
    // Convert camelCase to snake_case for database
    const dbExpense = {
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      payment_method: expense.paymentMethod,
      receipt_url: expense.receiptUrl
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert([dbExpense])
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      date: data.date,
      category: data.category,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.payment_method,
      receiptUrl: data.receipt_url
    };
  },

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;

    const { data, error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase for frontend
    return {
      id: data.id,
      date: data.date,
      category: data.category,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.payment_method,
      receiptUrl: data.receipt_url
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Test database connectivity and schema
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return { success: false, error: testError };
    }
    
    console.log('Database connection successful');
    
    // Test table schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'tenants' })
      .single();
    
    if (schemaError) {
      console.log('Could not get schema info, but connection works');
    } else {
      console.log('Table schema:', schemaData);
    }
    
    return { success: true };
  } catch (err) {
    console.error('Database test error:', err);
    return { success: false, error: err };
  }
};