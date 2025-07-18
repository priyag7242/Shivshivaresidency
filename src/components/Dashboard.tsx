import React from 'react';
import { Users, Building, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useData } from '../hooks/useData';

const Dashboard: React.FC = () => {
  const { tenants, rooms, bills, expenses, loading, error } = useData();

  // Calculate stats
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const monthlyCollection = bills.reduce((sum, bill) => sum + (bill.paymentStatus === 'paid' ? bill.totalAmount : 0), 0);
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const statCards = [
    {
      label: 'Active Tenants',
      value: activeTenants,
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Total Rooms',
      value: totalRooms,
      icon: Building,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Monthly Collection',
      value: `₹${monthlyCollection.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Monthly Expenses',
      value: `₹${monthlyExpenses.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-red-100 text-red-700',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: CheckCircle,
      color: 'bg-teal-100 text-teal-700',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card">
        <div className="card-header">
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome! Here’s what’s happening with your PG today.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card flex items-center p-6">
              <div className={`p-3 rounded-xl mr-4 ${stat.color}`}><Icon className="h-6 w-6" /></div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default Dashboard;