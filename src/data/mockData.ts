import { Tenant, Room, Bill, Payment, Expense } from '../types';

export const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    roomNumber: '101',
    joiningDate: '2024-01-15',
    monthlyRent: 8000,
    securityDeposit: 8000,
    electricityJoiningReading: 1250,
    status: 'active',
    createdDate: '2024-01-15',
    lastElectricityReading: 1380,
    hasFood: true,
    foodAmount: 3000
  },
  {
    id: '2',
    name: 'Priya Sharma',
    mobile: '9876543211',
    roomNumber: '102',
    joiningDate: '2024-02-01',
    monthlyRent: 7000,
    securityDeposit: 7000,
    electricityJoiningReading: 890,
    status: 'active',
    createdDate: '2024-02-01',
    lastElectricityReading: 1020,
    hasFood: false,
    foodAmount: 0
  },
  {
    id: '3',
    name: 'Amit Patel',
    mobile: '9876543212',
    roomNumber: '201',
    joiningDate: '2024-01-20',
    monthlyRent: 6000,
    securityDeposit: 0,
    electricityJoiningReading: 2100,
    status: 'active',
    createdDate: '2024-01-20',
    lastElectricityReading: 2250,
    hasFood: true,
    foodAmount: 2500
  }
];

export const mockRooms: Room[] = [
  { id: '1', roomNumber: '101', floor: 1, roomType: 'single', capacity: 1, rentAmount: 8000, status: 'occupied', tenantId: '1' },
  { id: '2', roomNumber: '102', floor: 1, roomType: 'single', capacity: 1, rentAmount: 7000, status: 'occupied', tenantId: '2' },
  { id: '3', roomNumber: '103', floor: 1, roomType: 'double', capacity: 2, rentAmount: 6000, status: 'vacant' },
  { id: '4', roomNumber: '104', floor: 1, roomType: 'double', capacity: 2, rentAmount: 6000, status: 'vacant' },
  { id: '5', roomNumber: '201', floor: 2, roomType: 'triple', capacity: 3, rentAmount: 5000, status: 'occupied', tenantId: '3' },
  { id: '6', roomNumber: '202', floor: 2, roomType: 'triple', capacity: 3, rentAmount: 5000, status: 'vacant' },
  { id: '7', roomNumber: '203', floor: 2, roomType: 'quad', capacity: 4, rentAmount: 4500, status: 'maintenance' },
  { id: '8', roomNumber: '204', floor: 2, roomType: 'quad', capacity: 4, rentAmount: 4500, status: 'vacant' }
];

export const mockBills: Bill[] = [
  {
    id: '1',
    tenantId: '1',
    billingPeriod: '2024-03',
    electricityReading: 1380,
    rentAmount: 8000,
    electricityCharges: 1560,
    adjustments: 0,
    totalAmount: 9560,
    billDate: '2024-03-01',
    paymentStatus: 'paid',
    paymentDate: '2024-03-05',
    paymentMethod: 'upi',
    dueDate: '2024-03-10'
  },
  {
    id: '2',
    tenantId: '2',
    billingPeriod: '2024-03',
    electricityReading: 1020,
    rentAmount: 7000,
    electricityCharges: 1560,
    adjustments: 0,
    totalAmount: 8560,
    billDate: '2024-03-01',
    paymentStatus: 'unpaid',
    dueDate: '2024-03-10'
  },
  {
    id: '3',
    tenantId: '3',
    billingPeriod: '2024-03',
    electricityReading: 2250,
    rentAmount: 6000,
    electricityCharges: 1800,
    adjustments: 0,
    totalAmount: 7800,
    billDate: '2024-03-01',
    paymentStatus: 'partial',
    dueDate: '2024-03-10'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    billId: '1',
    tenantId: '1',
    paymentAmount: 9560,
    paymentDate: '2024-03-05',
    paymentMethod: 'upi',
    paymentStatus: 'completed',
    receiptSent: true,
    notes: 'GPay payment'
  },
  {
    id: '2',
    billId: '3',
    tenantId: '3',
    paymentAmount: 4000,
    paymentDate: '2024-03-08',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    receiptSent: false,
    notes: 'Partial payment'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-03-01',
    category: 'Maintenance & Repairs',
    description: 'Plumbing repair in Room 103',
    amount: 1500,
    paymentMethod: 'cash'
  },
  {
    id: '2',
    date: '2024-03-05',
    category: 'Utilities',
    description: 'Internet bill for March',
    amount: 2000,
    paymentMethod: 'online'
  },
  {
    id: '3',
    date: '2024-03-10',
    category: 'Cleaning Supplies',
    description: 'Cleaning materials purchase',
    amount: 800,
    paymentMethod: 'cash'
  }
];

export const expenseCategories = [
  'Maintenance & Repairs',
  'Utilities',
  'Cleaning Supplies',
  'Security Services',
  'Food & Groceries',
  'Staff Salaries',
  'Other Expenses'
];

export const paymentMethods = [
  'cash',
  'online',
  'upi',
  'bank_transfer',
  'cheque'
];