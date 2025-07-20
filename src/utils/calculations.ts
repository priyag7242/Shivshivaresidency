import { Bill, Tenant, Payment, Room, RoomVacancyForecast } from '../types';

export const calculateElectricityCharges = (
  currentReading: number,
  previousReading: number,
  ratePerUnit: number = 12
): number => {
  const units = currentReading - previousReading;
  return units * ratePerUnit;
};

export const calculateTotalBill = (
  rent: number,
  electricityCharges: number,
  adjustments: number = 0
): number => {
  return rent + electricityCharges + adjustments;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateDDMMYYYY = (date: string): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const getMonthDateRange = (monthString: string): { startDate: string; endDate: string } => {
  // Parse month string like "2025-07"
  const [year, month] = monthString.split('-').map(Number);
  
  // Create start date (first day of month)
  const startDate = new Date(year, month - 1, 1);
  
  // Create end date (last day of month)
  const endDate = new Date(year, month, 0);
  
  return {
    startDate: formatDateDDMMYYYY(startDate.toISOString()),
    endDate: formatDateDDMMYYYY(endDate.toISOString())
  };
};

export const getDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const calculateOccupancyRate = (totalRooms: number, occupiedRooms: number): number => {
  return totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
};

export const calculateCollectionRate = (totalBills: number, paidBills: number): number => {
  return totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;
};

export const calculateRoomStatistics = (rooms: Room[], tenants: Tenant[]) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const vacantRooms = rooms.filter(room => room.status === 'vacant').length;
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  // Calculate total capacity
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);

  // Calculate total rent from tenants
  const totalRent = tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);

  // Calculate room type distribution
  const roomTypeStats = {
    single: rooms.filter(room => room.roomType === 'single').length,
    double: rooms.filter(room => room.roomType === 'double').length,
    triple: rooms.filter(room => room.roomType === 'triple').length,
    quad: rooms.filter(room => room.roomType === 'quad').length
  };

  return {
    totalRooms,
    occupiedRooms,
    vacantRooms,
    maintenanceRooms,
    occupancyRate,
    totalCapacity,
    totalRent,
    roomTypeStats
  };
};

export const generateReceiptText = (
  tenant: Tenant,
  bill: Bill,
  payment?: Payment
): string => {
  const electricityUnits = bill.electricityReading - (tenant.lastElectricityReading || tenant.electricityJoiningReading);
  
  return `
SHIVSHIVARESIDENCY
---------------------------------
Tenant Name: ${tenant.name}
Mobile: ${tenant.mobile}
Room Number: ${tenant.roomNumber}
Billing Period: ${(() => {
  const range = getMonthDateRange(bill.billingPeriod);
  return `${range.startDate} to ${range.endDate}`;
})()}
---------------------------------
Monthly Rent: ${formatCurrency(bill.rentAmount)}
Electricity Units: ${electricityUnits} × ₹12 = ${formatCurrency(bill.electricityCharges)}
Previous Reading: ${tenant.lastElectricityReading || tenant.electricityJoiningReading}
Current Reading: ${bill.electricityReading}
Security Deposit: ${formatCurrency(tenant.securityDeposit)}
Adjustments: ${formatCurrency(bill.adjustments)}
---------------------------------
TOTAL AMOUNT: ${formatCurrency(bill.totalAmount)}
PAYMENT STATUS: ${bill.paymentStatus.toUpperCase()}
${payment ? `Payment Date: ${formatDate(payment.paymentDate)}` : ''}
${payment ? `Payment Method: ${payment.paymentMethod.toUpperCase()}` : ''}
---------------------------------
Date: ${formatDate(bill.billDate)}
---------------------------------
Authorized by: Shiv shiva residency
UPI ID: jyotishivshiva@ybl
Contact: +91 8929400391
Address: A-373 sector 70, Noida-201301
  `.trim();
};

export const calculateRoomVacancyForecast = (
  tenants: Tenant[],
  rooms: Room[],
  monthsAhead: number = 3
): RoomVacancyForecast[] => {
  const forecasts: RoomVacancyForecast[] = [];
  const now = new Date();
  
  for (let i = 0; i < monthsAhead; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = targetDate.toISOString().slice(0, 7); // YYYY-MM format
    const monthName = targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    // Find tenants departing in this month
    const departingTenants = tenants.filter(tenant => {
      if (!tenant.departureDate || tenant.status !== 'active') return false;
      const departureMonth = tenant.departureDate.slice(0, 7); // YYYY-MM format
      return departureMonth === monthKey;
    });
    
    // Get rooms that will become vacant
    const roomsBecomingVacant = departingTenants.map(tenant => ({
      roomNumber: tenant.roomNumber,
      tenantName: tenant.name,
      departureDate: tenant.departureDate!
    }));
    
    // Calculate current room status for this month
    const totalRooms = rooms.length;
    const currentlyOccupied = rooms.filter(room => room.status === 'occupied').length;
    const currentlyVacant = rooms.filter(room => room.status === 'vacant').length;
    const departingCount = departingTenants.length;
    
    // Available rooms = currently vacant + rooms becoming vacant
    const availableRooms = currentlyVacant + departingCount;
    
    forecasts.push({
      month: monthKey,
      monthName,
      totalRooms,
      occupiedRooms: currentlyOccupied,
      vacantRooms: currentlyVacant,
      departingTenants: departingCount,
      availableRooms,
      roomsBecomingVacant
    });
  }
  
  return forecasts;
};

export const getCurrentMonthVacancyForecast = (
  tenants: Tenant[],
  rooms: Room[]
): RoomVacancyForecast | null => {
  const forecasts = calculateRoomVacancyForecast(tenants, rooms, 1);
  return forecasts.length > 0 ? forecasts[0] : null;
};

export const getFloorLabel = (roomNumber: string): string => {
  if (!roomNumber) return '';
  if (/^g\d+/i.test(roomNumber)) return 'Ground Floor';
  const firstChar = roomNumber.charAt(0);
  if (!isNaN(Number(firstChar))) return `Floor ${firstChar}`;
  return '';
};