import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, TrendingUp, CheckCircle, Shield, Home, Zap } from 'lucide-react';
import { useData } from '../hooks/useData';
import { supabase } from '../lib/supabase';
import { getFloorLabel } from '../utils/calculations';

interface ElectricityStats {
  totalUnits: number;
  totalAmount: number;
  totalCollected: number;
  pendingAmount: number;
  currentMonthUnits: number;
  currentMonthAmount: number;
}

interface DashboardProps {
  onStatClick?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStatClick }) => {
  const { tenants, rooms, bills, expenses, loading, error } = useData();
  const [electricityStats, setElectricityStats] = useState<ElectricityStats>({
    totalUnits: 0,
    totalAmount: 0,
    totalCollected: 0,
    pendingAmount: 0,
    currentMonthUnits: 0,
    currentMonthAmount: 0
  });

  // Calculate stats based on actual tenant statuses in the data
  const statusList = [
    'active', 'paid', 'due', 'adjust', 'departing', 'left', 'pending', 'terminated', 'inactive', 'hold', 'prospective'
  ];
  
  const statusCounts = Object.fromEntries(
    statusList.map(status => [status, tenants.filter(t => t.status === status).length])
  );
  
  // Calculate financial totals
  const totalRent = tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  const totalSecurityDeposit = tenants.reduce((sum, tenant) => sum + tenant.securityDeposit, 0);
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const monthlyCollection = bills.reduce((sum, bill) => sum + (bill.paymentStatus === 'paid' ? bill.totalAmount : 0), 0);
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Calculate room type stats
  const singleRooms = rooms.filter(r => r.roomType === 'single');
  const doubleRooms = rooms.filter(r => r.roomType === 'double');
  const tripleRooms = rooms.filter(r => r.roomType === 'triple');
  const singleOccupied = singleRooms.filter(r => r.status === 'occupied').length;
  const doubleOccupied = doubleRooms.filter(r => r.status === 'occupied').length;
  const tripleOccupied = tripleRooms.filter(r => r.status === 'occupied').length;

  // Fetch electricity stats
  const fetchElectricityStats = async () => {
    try {
      const { data, error } = await supabase
        .from('electricity_stats_view')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setElectricityStats({
          totalUnits: data.total_units || 0,
          totalAmount: data.total_amount || 0,
          totalCollected: data.collected_amount || 0,
          pendingAmount: data.pending_amount || 0,
          currentMonthUnits: data.current_month_units || 0,
          currentMonthAmount: data.current_month_amount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching electricity stats:', error);
    }
  };

  useEffect(() => {
    fetchElectricityStats();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      label: 'Active Tenants',
      value: activeTenants,
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      tab: 'tenants',
    },
    {
      label: 'Total Rooms',
      value: totalRooms,
      icon: Building,
      color: 'bg-purple-100 text-purple-700',
      tab: 'rooms',
    },
    {
      label: 'Total Monthly Rent',
      value: formatCurrency(totalRent),
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
      tab: 'rent',
    },
    {
      label: 'Total Security Deposit',
      value: formatCurrency(totalSecurityDeposit),
      icon: Shield,
      color: 'bg-yellow-100 text-yellow-700',
      tab: 'security',
    },
    {
      label: 'Monthly Collection',
      value: formatCurrency(monthlyCollection),
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700',
      tab: 'collection',
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses),
      icon: TrendingUp,
      color: 'bg-red-100 text-red-700',
      tab: 'expenses',
    },
    {
      label: 'Electricity Collected',
      value: formatCurrency(electricityStats.totalCollected),
      icon: Zap,
      color: 'bg-orange-100 text-orange-700',
      tab: 'electricity',
    },
    {
      label: 'Electricity Pending',
      value: formatCurrency(electricityStats.pendingAmount),
      icon: Zap,
      color: 'bg-pink-100 text-pink-700',
      tab: 'electricity',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: CheckCircle,
      color: 'bg-teal-100 text-teal-700',
      tab: 'occupancy',
    },
    {
      label: 'Total Tenants',
      value: tenants.length,
      icon: Home,
      color: 'bg-indigo-100 text-indigo-700',
      tab: 'tenants',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'adjust':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'departing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'left':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prospective':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Room Overview */}
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => onStatClick && onStatClick('rooms')}>
          <div className="flex items-center mb-2"><Building className="h-6 w-6 mr-2 text-purple-700" /><span className="font-bold text-lg">Room Overview</span></div>
          <div className="flex justify-between mt-2">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{totalRooms}</span>
              <span className="text-gray-600">Total Rooms</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-red-600">{totalRooms - occupiedRooms}</span>
              <span className="text-gray-600">Vacant Rooms</span>
            </div>
          </div>
        </div>
        {/* Tenant Overview */}
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => onStatClick && onStatClick('tenants')}>
          <div className="flex items-center mb-2"><Users className="h-6 w-6 mr-2 text-blue-700" /><span className="font-bold text-lg">Tenant Overview</span></div>
          <div className="flex justify-between mt-2">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{tenants.length}</span>
              <span className="text-gray-600">Total Tenants</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-green-600">{activeTenants}</span>
              <span className="text-gray-600">Active Tenants</span>
            </div>
          </div>
        </div>
        {/* Expense Overview */}
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => onStatClick && onStatClick('expenses')}>
          <div className="flex items-center mb-2"><TrendingUp className="h-6 w-6 mr-2 text-red-700" /><span className="font-bold text-lg">Expense Overview</span></div>
          <div className="flex flex-col items-center mt-2">
            <span className="text-3xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</span>
            <span className="text-gray-600">Monthly Expenses</span>
          </div>
        </div>
        {/* Total Monthly Rent */}
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => onStatClick && onStatClick('rent')}>
          <div className="flex items-center mb-2"><DollarSign className="h-6 w-6 mr-2 text-green-700" /><span className="font-bold text-lg">Total Monthly Rent</span></div>
          <div className="flex flex-col items-center mt-2">
            <span className="text-3xl font-bold text-green-600">{formatCurrency(totalRent)}</span>
          </div>
        </div>
        {/* Total Security Deposit */}
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => onStatClick && onStatClick('security')}>
          <div className="flex items-center mb-2"><Shield className="h-6 w-6 mr-2 text-yellow-700" /><span className="font-bold text-lg">Total Security Deposit</span></div>
          <div className="flex flex-col items-center mt-2">
            <span className="text-3xl font-bold text-yellow-600">{formatCurrency(totalSecurityDeposit)}</span>
          </div>
        </div>
        {/* Monthly Collection */}
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => onStatClick && onStatClick('collection')}>
          <div className="flex items-center mb-2"><TrendingUp className="h-6 w-6 mr-2 text-emerald-700" /><span className="font-bold text-lg">Monthly Collection</span></div>
          <div className="flex flex-col items-center mt-2">
            <span className="text-3xl font-bold text-emerald-600">{formatCurrency(monthlyCollection)}</span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Monthly Rent:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalRent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Security Deposit:</span>
              <span className="font-semibold text-yellow-600">{formatCurrency(totalSecurityDeposit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Collection:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(monthlyCollection)}</span>
              </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Expenses:</span>
              <span className="font-semibold text-red-600">{formatCurrency(monthlyExpenses)}</span>
              </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Net Income:</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(monthlyCollection - monthlyExpenses)}
              </span>
            </div>
          </div>
      </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Electricity Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Units:</span>
              <span className="font-semibold">{electricityStats.totalUnits}</span>
                    </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-orange-600">{formatCurrency(electricityStats.totalAmount)}</span>
                  </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Collected:</span>
              <span className="font-semibold text-green-600">{formatCurrency(electricityStats.totalCollected)}</span>
                  </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending:</span>
              <span className="font-semibold text-red-600">{formatCurrency(electricityStats.pendingAmount)}</span>
                </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Current Month:</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(electricityStats.currentMonthAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Occupancy Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Rooms:</span>
              <span className="font-semibold">{totalRooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Occupied Rooms:</span>
              <span className="font-semibold text-green-600">{occupiedRooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vacant Rooms:</span>
              <span className="font-semibold text-red-600">{totalRooms - occupiedRooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Occupancy Rate:</span>
              <span className="font-semibold text-blue-600">{occupancyRate}%</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Active Tenants:</span>
              <span className="font-bold text-lg text-green-600">{activeTenants}</span>
            </div>
          </div>
                    </div>
                  </div>

      {/* Room Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Room Type Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Single Rooms:</span>
              <span className="font-semibold">{singleOccupied} / {singleRooms.length} occupied</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Double Rooms:</span>
              <span className="font-semibold">{doubleOccupied} / {doubleRooms.length} occupied</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Triple Rooms:</span>
              <span className="font-semibold">{tripleOccupied} / {tripleRooms.length} occupied</span>
            </div>
          </div>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default Dashboard;