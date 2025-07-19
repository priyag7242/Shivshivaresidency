import { useState, useEffect } from 'react';
import { Tenant, Room, Bill, Payment, Expense } from '../types';
import { 
  tenantsService, 
  roomsService, 
  billsService, 
  paymentsService, 
  expensesService 
} from '../services/database';

export const useData = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Force refresh data
  const refreshData = async () => {
    console.log('Force refreshing data...');
    await loadData();
  };

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear any cached data first
      setTenants([]);
      setRooms([]);
      setBills([]);
      setPayments([]);
      setExpenses([]);

      // Test database connection first
      console.log('Testing database connection...');
      const connectionTest = await billsService.testConnection();
      console.log('Database connection test result:', connectionTest);

      const [tenantsData, roomsData, billsData, paymentsData, expensesData] = await Promise.all([
        tenantsService.getAll(),
        roomsService.getAll(),
        billsService.getAll(),
        paymentsService.getAll(),
        expensesService.getAll(),
      ]);

      console.log('Loaded data from database:', {
        tenants: tenantsData.length,
        rooms: roomsData.length,
        bills: billsData.length,
        payments: paymentsData.length,
        expenses: expensesData.length
      });

      setTenants(tenantsData);
      setRooms(roomsData);
      setBills(billsData);
      setPayments(paymentsData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tenant operations
  const addTenant = async (tenantData: Omit<Tenant, 'id'>) => {
    try {
      const newTenant = await tenantsService.create(tenantData);
      setTenants(prev => [newTenant, ...prev]);

      // Find and update room status
      const roomToUpdate = rooms.find(r => r.roomNumber === tenantData.roomNumber);
      if (roomToUpdate) {
        await roomsService.update(roomToUpdate.id, { 
          status: 'occupied', 
          tenantId: newTenant.id 
        });
      
        // Update local state
        setRooms(prev => prev.map(r => 
          r.id === roomToUpdate.id 
            ? { ...r, status: 'occupied', tenantId: newTenant.id }
            : r
        ));
      }

      return newTenant;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add tenant');
    }
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    try {
      console.log('Updating tenant with ID:', id, 'Updates:', updates);
      const updatedTenant = await tenantsService.update(id, updates);
      console.log('Tenant updated successfully:', updatedTenant);
      setTenants(prev => prev.map(t => t.id === id ? updatedTenant : t));
      return updatedTenant;
    } catch (err) {
      console.error('Error updating tenant (full details):', err);
      if (err && typeof err === 'object' && 'message' in err) {
        throw new Error((err as any).message);
      }
      throw new Error(JSON.stringify(err));
    }
  };

  // Room operations
  const addRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      const newRoom = await roomsService.create(roomData);
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add room');
    }
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const updatedRoom = await roomsService.update(id, updates);
      setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r));
      return updatedRoom;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update room');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await roomsService.delete(id);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  // Bill operations
  const generateBill = async (billData: Omit<Bill, 'id'>) => {
    try {
      console.log('Generating bill with data:', billData);
      
      const newBill = await billsService.create(billData);
      console.log('Bill created successfully:', newBill);
      
      setBills(prev => [newBill, ...prev]);

      // Temporarily disable tenant update to isolate the issue
      // console.log('Updating tenant electricity reading for tenant:', billData.tenantId);
      // await updateTenant(billData.tenantId, {
      //   lastElectricityReading: billData.electricityReading
      // });
      // console.log('Tenant updated successfully');

      return newBill;
    } catch (err) {
      console.error('Error in generateBill:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      throw new Error(err instanceof Error ? err.message : 'Failed to generate bill');
    }
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    try {
      const updatedBill = await billsService.update(id, updates);
      setBills(prev => prev.map(b => b.id === id ? updatedBill : b));
      return updatedBill;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update bill');
    }
  };

  const deleteBill = async (id: string) => {
    try {
      await billsService.delete(id);
      setBills(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete bill');
    }
  };

  // Payment operations
  const recordPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const newPayment = await paymentsService.create(paymentData);
      setPayments(prev => [newPayment, ...prev]);

      // Update bill payment status
      const bill = bills.find(b => b.id === paymentData.billId);
      if (bill) {
        const isFullPayment = paymentData.paymentAmount >= bill.totalAmount;
        await updateBill(bill.id, {
          paymentStatus: isFullPayment ? 'paid' : 'partial',
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod
        });
      }

      return newPayment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  // Expense operations
  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await expensesService.create(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const updatedExpense = await expensesService.update(id, updates);
      setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
      return updatedExpense;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update expense');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expensesService.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  return {
    // Data
    tenants,
    rooms,
    bills,
    payments,
    expenses,
    loading,
    error,
    
    // Operations
    loadData,
    refreshData,
    addTenant,
    updateTenant,
    addRoom,
    updateRoom,
    deleteRoom,
    generateBill,
    updateBill,
    deleteBill,
    recordPayment,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};