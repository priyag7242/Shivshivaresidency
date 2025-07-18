import React from 'react';
import { Home, Users, Building, Receipt, CreditCard, TrendingUp, LogOut } from 'lucide-react';
import { useAuth, AuthUser } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: AuthUser;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user }) => {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'rooms', icon: Building, label: 'Rooms' },
    { id: 'tenants', icon: Users, label: 'Tenants' },
    { id: 'billing', icon: Receipt, label: 'Billing' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'expenses', icon: TrendingUp, label: 'Expenses' }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Shivshivaresidency</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.email}
                {user.role && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {user.role}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation */}
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex space-x-1 overflow-x-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;