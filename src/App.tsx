import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RoomStatusView from './components/rooms/RoomStatusView';
import TenantManagement from './components/tenants/TenantManagement';
import ElectricityManagement from './components/electricity/ElectricityManagement';
import BillingManagement from './components/billing/BillingManagement';
import PaymentManagement from './components/payments/PaymentManagement';
import ExpenseManagement from './components/expenses/ExpenseManagement';
import LoginForm from './components/auth/LoginForm';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';

function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    tenants,
    bills,
    payments,
    expenses,
    loading: dataLoading,
    error,
    generateBill,
    updateBill,
    recordPayment,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteBill,
  } = useData();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Calculate dashboard metrics (commented out as Dashboard component manages its own data)
  // const calculateMetrics = (): DashboardMetrics => {
  //   const activeTenants = tenants.filter(tenant => tenant.status === 'active').length;
  //   const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  //   const totalRooms = rooms.length;

  //   const currentMonth = new Date().toISOString().slice(0, 7);
  //   const currentMonthBills = bills.filter(bill => bill.billingPeriod === currentMonth);
  //   const currentMonthExpenses = expenses.filter(expense => expense.date.startsWith(currentMonth));

  //   const monthlyCollection = currentMonthBills
  //     .filter(bill => bill.paymentStatus === 'paid')
  //     .reduce((sum, bill) => sum + bill.totalAmount, 0);

  //   const monthlyPending = currentMonthBills
  //     .filter(bill => bill.paymentStatus === 'unpaid')
  //     .reduce((sum, bill) => sum + bill.totalAmount, 0);

  //   const monthlyExpenses = currentMonthExpenses
  //     .reduce((sum, expense) => sum + expense.amount, 0);

  //   const securityDeposit = tenants
  //     .filter(tenant => tenant.status === 'active')
  //     .reduce((sum, tenant) => sum + tenant.securityDeposit, 0);

  //   const occupancyRate = calculateOccupancyRate(totalRooms, occupiedRooms);
  //   const collectionRate = calculateCollectionRate(
  //     currentMonthBills.length,
  //     currentMonthBills.filter(bill => bill.paymentStatus === 'paid').length
  //   );

  //   return {
  //     activeTenants,
  //     monthlyCollection,
  //     monthlyPending,
  //     monthlyExpenses,
  //     securityDeposit,
  //     occupancyRate,
  //     collectionRate
  //   };
  // };

  // Metrics calculation removed as Dashboard component manages its own data

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show error if data loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onStatClick={setActiveTab} />;
      case 'rooms':
        return <RoomStatusView />;
      case 'room-status':
        return <RoomStatusView />;
      case 'tenants':
        return <TenantManagement />;
      case 'electricity':
        return <ElectricityManagement />;
      case 'billing':
        return (
          <BillingManagement
            bills={bills}
            tenants={tenants}
            payments={payments}
            onGenerateBill={generateBill}
            onDeleteBill={deleteBill}
            loading={dataLoading}
          />
        );
      case 'payments':
        return (
          <PaymentManagement
            bills={bills}
            tenants={tenants}
            payments={payments}
            onRecordPayment={recordPayment}
            onUpdateBill={updateBill}
          />
        );
      case 'expenses':
        return (
          <ExpenseManagement
            expenses={expenses}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user}>
      {renderActiveTab()}
    </Layout>
  );
}

export default App;