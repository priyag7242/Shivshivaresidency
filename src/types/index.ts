export interface Tenant {
  id: string;
  name: string;
  mobile: string;
  roomNumber: string;
  joiningDate: string;
  monthlyRent: number;
  securityDeposit: number;
  electricityJoiningReading: number;
  status: 'active' | 'inactive';
  createdDate: string;
  lastElectricityReading?: number;
  // New fields for food and individual rent
  hasFood: boolean;
  category?: 'new' | 'existing' | 'no_security';
  // New fields for departure tracking
  departureDate?: string;
  stayDuration?: '1' | '2' | '3' | 'unknown';
  noticeGiven?: boolean;
  noticeDate?: string;
  securityAdjustment?: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  rentAmount: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenantId?: string;
  // New fields for multiple tenants support
  totalCapacity?: number;
  totalRent?: number;
  tenantCount?: number;
}

export interface Bill {
  id: string;
  tenantId: string;
  billingPeriod: string;
  electricityReading: number;
  rentAmount: number;
  electricityCharges: number;
  adjustments: number;
  totalAmount: number;
  billDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
  paymentMethod?: string;
  dueDate: string;
}

export interface Payment {
  id: string;
  billId: string;
  tenantId: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'online' | 'upi' | 'bank_transfer' | 'cheque';
  paymentStatus: 'completed' | 'pending';
  receiptSent: boolean;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  receiptUrl?: string;
}

export interface DashboardMetrics {
  activeTenants: number;
  monthlyCollection: number;
  monthlyPending: number;
  monthlyExpenses: number;
  securityDeposit: number;
  occupancyRate: number;
  collectionRate: number;
}

export interface RoomVacancyForecast {
  month: string;
  monthName: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  departingTenants: number;
  availableRooms: number;
  roomsBecomingVacant: Array<{
    roomNumber: string;
    tenantName: string;
    departureDate: string;
  }>;
}