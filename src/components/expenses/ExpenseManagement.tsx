import React, { useState } from 'react';
import { Expense } from '../../types';
import { TrendingUp, Plus, Edit, Trash2, Receipt, Calendar, DollarSign, CreditCard, Package, Users, Wrench, Shield } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { expenseCategories, paymentMethods } from '../../data/mockData';

interface ExpenseManagementProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ 
  expenses, 
  onAddExpense, 
  onUpdateExpense, 
  onDeleteExpense 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Calculate stats
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(selectedMonth)
  );
  
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryWiseExpenses = expenseCategories.map(category => ({
    category,
    amount: currentMonthExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
    count: currentMonthExpenses.filter(expense => expense.category === category).length
  })).filter(item => item.amount > 0);

  const paymentMethodStats = paymentMethods.map(method => ({
    method,
    amount: currentMonthExpenses
      .filter(expense => expense.paymentMethod === method)
      .reduce((sum, expense) => sum + expense.amount, 0),
    count: currentMonthExpenses.filter(expense => expense.paymentMethod === method).length
  })).filter(item => item.amount > 0);

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch = selectedCategory === 'all' || expense.category === selectedCategory;
    const monthMatch = expense.date.startsWith(selectedMonth);
    return categoryMatch && monthMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Maintenance & Repairs': return Wrench;
      case 'Utilities': return TrendingUp;
      case 'Cleaning Supplies': return Package;
      case 'Security Services': return Shield;
      case 'Food & Groceries': return Package;
      case 'Staff Salaries': return Users;
      default: return Receipt;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Maintenance & Repairs': return 'bg-red-100 text-red-800';
      case 'Utilities': return 'bg-blue-100 text-blue-800';
      case 'Cleaning Supplies': return 'bg-green-100 text-green-800';
      case 'Security Services': return 'bg-purple-100 text-purple-800';
      case 'Food & Groceries': return 'bg-orange-100 text-orange-800';
      case 'Staff Salaries': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ExpenseForm = () => {
    const [formData, setFormData] = useState({
      date: editingExpense?.date || new Date().toISOString().split('T')[0],
      category: editingExpense?.category || '',
      description: editingExpense?.description || '',
      amount: editingExpense?.amount.toString() || '',
      paymentMethod: editingExpense?.paymentMethod || 'cash'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const expenseData = {
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod
      };

      if (editingExpense) {
        onUpdateExpense(editingExpense.id, expenseData);
        setEditingExpense(null);
      } else {
        onAddExpense(expenseData);
      }

      setShowAddForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        paymentMethod: 'cash'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingExpense(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expense Management</h2>
            <p className="text-gray-600 mt-1">Track and manage all PG expenses</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{currentMonthExpenses.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories Used</p>
              <p className="text-2xl font-bold text-green-600">{categoryWiseExpenses.length}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Expense</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentMonthExpenses.length > 0 ? formatCurrency(totalExpenses / currentMonthExpenses.length) : '₹0'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Category-wise Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category-wise Expenses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryWiseExpenses.map((item) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getCategoryColor(item.category).split(' ')[0]} bg-opacity-20`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.category}</p>
                    <p className="text-sm text-gray-500">{item.count} transactions</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethodStats.map((item) => (
            <div key={item.method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {item.method.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-500">{item.count} transactions</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Expense Records</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredExpenses.map((expense) => {
            const Icon = getCategoryIcon(expense.category);
            return (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${getCategoryColor(expense.category).split(' ')[0]} bg-opacity-20`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{expense.description}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1 inline" />
                          {formatDate(expense.date)}
                        </span>
                        <span className="text-sm text-gray-500 capitalize">
                          <CreditCard className="h-4 w-4 mr-1 inline" />
                          {expense.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowAddForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this expense?')) {
                            onDeleteExpense(expense.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredExpenses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No expenses found matching your filters.</p>
        </div>
      )}

      {/* Add/Edit Expense Form Modal */}
      {showAddForm && <ExpenseForm />}
    </div>
  );
};

export default ExpenseManagement;