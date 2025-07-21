import React, { useState } from 'react';
import { Bill, Tenant, Payment } from '../../types';
import { CreditCard, Plus, CheckCircle, Clock, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, getDaysOverdue } from '../../utils/calculations';

interface PaymentManagementProps {
  bills: Bill[];
  tenants: Tenant[];
  payments: Payment[];
  onRecordPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment>;
  onUpdateBill: (id: string, updates: Partial<Bill>) => Promise<Bill>;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ bills, tenants, payments, onRecordPayment, onUpdateBill }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const totalPaid = bills.filter(bill => bill.paymentStatus === 'paid').reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalUnpaid = bills.filter(bill => bill.paymentStatus === 'unpaid').reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalOverdue = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    return bill.paymentStatus === 'unpaid' && dueDate < today;
  }).reduce((sum, bill) => sum + bill.totalAmount, 0);

  const filteredBills = bills.filter(bill => {
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    
    switch (filter) {
      case 'paid':
        return bill.paymentStatus === 'paid';
      case 'unpaid':
        return bill.paymentStatus === 'unpaid';
      case 'overdue':
        return bill.paymentStatus === 'unpaid' && dueDate < today;
      default:
        return true;
    }
  });

  const RecordPaymentForm = () => {
    const [formData, setFormData] = useState({
      paymentAmount: selectedBill?.totalAmount.toString() || '',
      paymentMethod: 'cash' as 'cash' | 'online' | 'upi' | 'bank_transfer' | 'cheque',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBill) return;

      const paymentAmount = parseFloat(formData.paymentAmount);
      const isFullPayment = paymentAmount >= selectedBill.totalAmount;

      const newPayment: Omit<Payment, 'id'> = {
        billId: selectedBill.id,
        tenantId: selectedBill.tenantId,
        paymentAmount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'completed',
        receiptSent: false,
        notes: formData.notes
      };

      onRecordPayment(newPayment);

      // Update bill status
      const updatedBill: Bill = {
        ...selectedBill,
        paymentStatus: isFullPayment ? 'paid' : 'partial',
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod
      };

      onUpdateBill(selectedBill.id, updatedBill);

      setShowPaymentForm(false);
      setSelectedBill(null);
      setFormData({
        paymentAmount: '',
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
            {selectedBill && (
              <p className="text-sm text-gray-500 mt-1">
                Bill Amount: {formatCurrency(selectedBill.totalAmount)}
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.paymentAmount}
                onChange={(e) => setFormData({...formData, paymentAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter payment amount"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter full amount for complete payment, or partial amount for partial payment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as 'cash' | 'online' | 'upi' | 'bank_transfer' | 'cheque'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="online">Online Transfer</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Record Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedBill(null);
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

  const keyTableFields = [
    { key: 'tenant_id', label: 'Tenant' },
    { key: 'payment_amount', label: 'Amount' },
    { key: 'payment_date', label: 'Date' },
    { key: 'payment_method', label: 'Method' },
    { key: 'payment_status', label: 'Status' },
  ];

  // Edit Modal
  const EditPaymentModal = () => {
    if (!selectedPayment || !editFormData) return null;
    const tenant = tenants.find(t => t.id === editFormData.tenantId);
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };
    const handleEditTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };
    const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setProcessing(true);
      try {
        if (typeof (window as any).onUpdatePayment === 'function') {
          await (window as any).onUpdatePayment(selectedPayment.id, editFormData);
        }
        setShowEditModal(false);
        setSelectedPayment(null);
      } catch (error) {
        alert('Failed to update payment.');
      } finally {
        setProcessing(false);
      }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Payment</h3>
          </div>
          <form onSubmit={handleEditSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
              <select name="tenantId" value={editFormData.tenantId} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name} - Room {t.roomNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input name="paymentAmount" type="number" value={editFormData.paymentAmount} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input name="paymentDate" type="date" value={editFormData.paymentDate} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select name="paymentMethod" value={editFormData.paymentMethod} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="cash">Cash</option>
                <option value="online">Online Transfer</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="paymentStatus" value={editFormData.paymentStatus} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea name="notes" value={editFormData.notes} onChange={handleEditTextAreaChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="col-span-2 flex space-x-3 pt-4">
              <button type="submit" disabled={processing} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{processing ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // View Modal
  const ViewPaymentModal = () => {
    if (!selectedPayment) return null;
    const tenant = tenants.find(t => t.id === selectedPayment.tenantId);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Tenant:</strong> {tenant ? tenant.name : selectedPayment.tenantId}</div>
            <div><strong>Room:</strong> {tenant ? tenant.roomNumber : '-'}</div>
            <div><strong>Amount:</strong> {formatCurrency(selectedPayment.paymentAmount)}</div>
            <div><strong>Date:</strong> {selectedPayment.paymentDate}</div>
            <div><strong>Method:</strong> {selectedPayment.paymentMethod}</div>
            <div><strong>Status:</strong> {selectedPayment.paymentStatus}</div>
            <div className="col-span-2"><strong>Notes:</strong> {selectedPayment.notes}</div>
          </div>
          <div className="flex space-x-3 p-6 pt-0">
            <button onClick={() => setShowViewModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Close</button>
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-gray-600 mt-1">Track and record tenant payments</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'paid' | 'unpaid' | 'overdue')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bills</option>
              <option value="paid">Paid Bills</option>
              <option value="unpaid">Unpaid Bills</option>
              <option value="overdue">Overdue Bills</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-sm font-medium text-gray-600">Total Unpaid</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalUnpaid)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Overdue</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Bills with Payment Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bills & Payments</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredBills.map((bill) => {
            const tenant = tenants.find(t => t.id === bill.tenantId);
            const StatusIcon = getStatusIcon(bill.paymentStatus);
            const daysOverdue = getDaysOverdue(bill.dueDate);
            
            if (!tenant) return null;

            return (
              <div key={bill.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {tenant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{tenant.name}</h4>
                      <p className="text-sm text-gray-500">
                        Room {tenant.roomNumber} • {bill.billingPeriod}
                        {daysOverdue > 0 && (
                          <span className="ml-2 text-red-600 font-medium">
                            {daysOverdue} days overdue
                          </span>
                        )}
                      </p>
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

                    {bill.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowPaymentForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1 inline" />
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>

                {bill.paymentStatus === 'paid' && bill.paymentDate && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">Paid on:</span>
                        <span className="font-medium">{formatDate(bill.paymentDate)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">Method:</span>
                        <span className="font-medium capitalize">{bill.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {filteredBills.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No bills found matching your filter criteria.</p>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-6 overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-xs">
          <thead>
            <tr>
              {keyTableFields.map(col => (
                <th key={col.key} className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200 border-r last:border-r-0">{col.label}</th>
              ))}
              <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
          {payments.slice(0, 10).map((payment) => {
            const tenant = tenants.find(t => t.id === payment.tenantId);
            if (!tenant) return null;
            return (
                <tr key={payment.id} className="hover:bg-blue-50 border-b border-gray-200">
                  {keyTableFields.map(col => {
                    const value = (payment as any)[col.key];
                    if (col.key === 'tenant_id') {
                      return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{tenant ? tenant.name : value}</td>;
                    }
                    if (col.key === 'payment_amount') {
                      return <td key={col.key} className="px-3 py-2 text-right border-r border-gray-200 last:border-r-0">{formatCurrency(value) ?? ''}</td>;
                    }
                    if (col.key === 'payment_status') {
                      return <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'completed' ? 'bg-green-100 text-green-700' : value === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{value}</span></td>;
                    }
                    return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{value ?? ''}</td>;
                  })}
                  <td className="px-3 py-2 flex space-x-2">
                    <button title="View" onClick={() => { setSelectedPayment(payment); setShowViewModal(true); }} className="p-1 rounded hover:bg-blue-100"><Eye className="h-4 w-4 text-blue-600" /></button>
                    <button title="Edit" onClick={() => { setSelectedPayment(payment); setEditFormData({ ...payment }); setShowEditModal(true); }} className="p-1 rounded hover:bg-yellow-100"><Edit className="h-4 w-4 text-yellow-600" /></button>
                    <button title="Delete" onClick={async () => {
                      if (window.confirm('Delete this payment?')) {
                        if (typeof (window as any).onDeletePayment === 'function') {
                          await (window as any).onDeletePayment(payment.id);
                        }
                      }
                    }} className="p-1 rounded hover:bg-red-100"><Trash2 className="h-4 w-4 text-red-600" /></button>
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* Record Payment Form Modal */}
      {showPaymentForm && <RecordPaymentForm />}
      {/* Edit Modal */}
      {showEditModal && <EditPaymentModal />}
      {/* View Modal */}
      {showViewModal && <ViewPaymentModal />}
    </div>
  );
};

export default PaymentManagement;