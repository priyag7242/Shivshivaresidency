import React, { useState } from 'react';
import { Bill, Tenant, Payment } from '../../types';
import { Receipt, Plus, Send, Eye, Calendar, Clock, CheckCircle, Printer } from 'lucide-react';
import { formatCurrency, formatDate, calculateElectricityCharges, calculateTotalBill } from '../../utils/calculations';
import { printReceipt, shareReceiptWhatsApp } from '../../utils/receiptGenerator';

interface BillingManagementProps {
  bills: Bill[];
  tenants: Tenant[];
  payments: Payment[];
  onGenerateBill: (bill: Omit<Bill, 'id'>) => Promise<Bill>;
  loading?: boolean;
}

const BillingManagement: React.FC<BillingManagementProps> = ({ 
  bills, 
  tenants, 
  payments, 
  onGenerateBill, 
  loading = false
}) => {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const totalBilled = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPaid = bills.filter(bill => bill.paymentStatus === 'paid').reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPending = bills.filter(bill => bill.paymentStatus === 'unpaid').reduce((sum, bill) => sum + bill.totalAmount, 0);
  const overdueBills = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    return bill.paymentStatus === 'unpaid' && dueDate < today;
  }).length;

  const GenerateBillForm = () => {
    const [formData, setFormData] = useState({
      tenantId: '',
      billingPeriod: new Date().toISOString().slice(0, 7),
      electricityReading: '',
      adjustments: '0'
    });

    const selectedTenant = tenants.find(t => t.id === formData.tenantId);
    const electricityCharges = selectedTenant && formData.electricityReading ? 
      calculateElectricityCharges(
        parseFloat(formData.electricityReading),
        selectedTenant.lastElectricityReading || selectedTenant.electricityJoiningReading
      ) : 0;

    const totalAmount = selectedTenant ? 
      calculateTotalBill(selectedTenant.monthlyRent, electricityCharges, parseFloat(formData.adjustments)) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTenant) return;

      setProcessing(true);
      try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);

        const newBill: Omit<Bill, 'id'> = {
          tenantId: formData.tenantId,
          billingPeriod: formData.billingPeriod,
          electricityReading: parseFloat(formData.electricityReading),
          rentAmount: selectedTenant.monthlyRent,
          electricityCharges,
          adjustments: parseFloat(formData.adjustments),
          totalAmount,
          billDate: new Date().toISOString().split('T')[0],
          paymentStatus: 'unpaid',
          dueDate: dueDate.toISOString().split('T')[0]
        };

        await onGenerateBill(newBill);
        setShowGenerateForm(false);
        setFormData({
          tenantId: '',
          billingPeriod: new Date().toISOString().slice(0, 7),
          electricityReading: '',
          adjustments: '0'
        });
      } catch (error) {
        console.error('Error generating bill:', error);
        alert('Failed to generate bill. Please try again.');
      } finally {
        setProcessing(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Generate New Bill</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant *</label>
              <select
                required
                value={formData.tenantId}
                onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Tenant</option>
                {tenants.filter(t => t.status === 'active').map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - Room {tenant.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Period *</label>
              <input
                type="month"
                required
                value={formData.billingPeriod}
                onChange={(e) => setFormData({...formData, billingPeriod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Electricity Reading *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.electricityReading}
                onChange={(e) => setFormData({...formData, electricityReading: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current meter reading"
              />
              {selectedTenant && (
                <p className="text-sm text-gray-500 mt-1">
                  Previous reading: {selectedTenant.lastElectricityReading || selectedTenant.electricityJoiningReading} units
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjustments</label>
              <input
                type="number"
                step="0.01"
                value={formData.adjustments}
                onChange={(e) => setFormData({...formData, adjustments: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter positive or negative adjustment"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use positive values for additional charges, negative for discounts
              </p>
            </div>

            {selectedTenant && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Bill Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span>{formatCurrency(selectedTenant.monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Electricity Charges:</span>
                    <span>{formatCurrency(electricityCharges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adjustments:</span>
                    <span>{formatCurrency(parseFloat(formData.adjustments))}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Generating...' : 'Generate Bill'}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
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

  const ReceiptModal = () => {
    if (!selectedBill) return null;

    const tenant = tenants.find(t => t.id === selectedBill.tenantId);
    const payment = payments.find(p => p.billId === selectedBill.id);
    
    if (!tenant) return null;

    const handlePrintReceipt = () => {
      printReceipt(tenant, selectedBill, payment);
    };

    const handleShareWhatsApp = () => {
      shareReceiptWhatsApp(tenant, selectedBill, payment);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4 font-mono text-sm">
              <div className="text-center font-bold mb-2">SHIVSHIVARESIDENCY</div>
              <div className="border-b border-gray-300 mb-2"></div>
              <div>Tenant: {tenant.name}</div>
              <div>Mobile: {tenant.mobile}</div>
              <div>Room: {tenant.roomNumber}</div>
              <div>Period: {selectedBill.billingPeriod}</div>
              <div className="border-b border-gray-300 my-2"></div>
              <div>Rent: {formatCurrency(selectedBill.rentAmount)}</div>
              <div>Electricity: {formatCurrency(selectedBill.electricityCharges)}</div>
              {selectedBill.adjustments !== 0 && (
                <div>Adjustments: {formatCurrency(selectedBill.adjustments)}</div>
              )}
              <div className="border-b border-gray-300 my-2"></div>
              <div className="font-bold">TOTAL: {formatCurrency(selectedBill.totalAmount)}</div>
              <div className="text-center mt-2">
                STATUS: {selectedBill.paymentStatus.toUpperCase()}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-4 w-4 mr-2 inline" />
                Print Receipt
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="h-4 w-4 mr-2 inline" />
                Share WhatsApp
              </button>
            </div>
            
            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full mt-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'unpaid': return Clock;
      case 'partial': return Clock;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Billing Management</h2>
            <p className="text-gray-600 mt-1">Generate and manage tenant bills</p>
          </div>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Generate Bill
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Billed</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBilled)}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
              <p className="text-2xl font-bold text-red-600">{overdueBills}</p>
            </div>
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bills</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {bills.map((bill) => {
            const tenant = tenants.find(t => t.id === bill.tenantId);
            const StatusIcon = getStatusIcon(bill.paymentStatus);
            
            if (!tenant) return null;

            return (
              <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{tenant.name}</h4>
                      <p className="text-sm text-gray-500">Room {tenant.roomNumber} • {bill.billingPeriod}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                      <p className="text-sm text-gray-500">Due: {formatDate(bill.dueDate)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <StatusIcon className="h-5 w-5 text-gray-400" />
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.paymentStatus)}`}>
                        {bill.paymentStatus}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowReceiptModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const payment = payments.find(p => p.billId === bill.id);
                          shareReceiptWhatsApp(tenant, bill, payment);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Rent</p>
                    <p className="font-medium">{formatCurrency(bill.rentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Electricity</p>
                    <p className="font-medium">{formatCurrency(bill.electricityCharges)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Adjustments</p>
                    <p className="font-medium">{formatCurrency(bill.adjustments)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(bill.totalAmount)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bills.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No bills generated yet. Generate your first bill to get started.</p>
        </div>
      )}

      {/* Generate Bill Form Modal */}
      {showGenerateForm && <GenerateBillForm />}

      {/* Receipt Modal */}
      {showReceiptModal && <ReceiptModal />}
    </div>
  );
};

export default BillingManagement;