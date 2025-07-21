import React, { useState } from 'react';
import { Bill, Tenant, Payment } from '../../types';
import { Receipt, Plus, Send, Eye, Calendar, Clock, CheckCircle, Printer, Trash2 } from 'lucide-react';
import { formatCurrency, formatDateDDMMYYYY, calculateElectricityCharges, calculateTotalBill } from '../../utils/calculations';
import { printReceipt, shareReceiptWhatsApp } from '../../utils/receiptGenerator';

interface BillingManagementProps {
  bills: Bill[];
  tenants: Tenant[];
  payments: Payment[];
  onGenerateBill: (bill: Omit<Bill, 'id'>) => Promise<Bill>;
  onDeleteBill?: (id: string) => Promise<void>;
  loading?: boolean;
}

const BillingManagement: React.FC<BillingManagementProps> = ({ 
  bills, 
  tenants, 
  payments, 
  onGenerateBill, 
  onDeleteBill,
  loading = false
}) => {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

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
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Electricity Calculation:</p>
                  <div className="text-sm text-blue-700 mt-1">
                    <div>Joining Reading: {selectedTenant.electricityJoiningReading || 0} units</div>
                    <div>Current Reading: {formData.electricityReading || 0} units</div>
                    <div className="font-medium mt-1">
                      Units Consumed: {(parseInt(formData.electricityReading) || 0) - (selectedTenant.electricityJoiningReading || 0)} units
                    </div>
                    <div className="font-medium">
                      Amount: ₹{((parseInt(formData.electricityReading) || 0) - (selectedTenant.electricityJoiningReading || 0)) * 12}
                    </div>
                  </div>
                </div>
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
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-blue-700">
                      <span>Electricity ({(parseInt(formData.electricityReading) || 0) - (selectedTenant.electricityJoiningReading || 0)} units × ₹12):</span>
                    <span>{formatCurrency(electricityCharges)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Joining: {selectedTenant.electricityJoiningReading || 0} | Current: {formData.electricityReading || 0}
                    </div>
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
      const tenant = tenants.find(t => t.id === selectedBill.tenantId);
      if (!tenant) return;
      printReceipt(
        tenant,
        selectedBill,
        payments.find(p => p.billId === selectedBill.id)
      );
    };

    const handleShareWhatsApp = () => {
      if (!selectedBill) return;
      const tenant = tenants.find(t => t.id === selectedBill.tenantId);
      if (!tenant) return;
      // Use Indian country code by default, adjust as needed
      const phone = `91${tenant.mobile}`;
      const message = encodeURIComponent(
        `Hi ${tenant.name}, your bill for ${selectedBill.billingPeriod} is ₹${selectedBill.totalAmount}. Please pay by ${selectedBill.dueDate}. Thank you!`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
                Print/Download
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

  // Edit Modal
  const EditBillModal = () => {
    if (!selectedBill || !editFormData) return null;
    const tenant = tenants.find(t => t.id === editFormData.tenantId);
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };
    const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setProcessing(true);
      try {
        // Call backend update (assume onUpdateBill is passed as prop or use billsService)
        if (typeof (window as any).onUpdateBill === 'function') {
          await (window as any).onUpdateBill(selectedBill.id, editFormData);
        }
        setShowEditModal(false);
        setSelectedBill(null);
      } catch (error) {
        alert('Failed to update bill.');
      } finally {
        setProcessing(false);
      }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Bill</h3>
          </div>
          <form onSubmit={handleEditSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
              <select name="tenantId" value={editFormData.tenantId} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name} - Room {t.roomNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Period</label>
              <input name="billingPeriod" type="month" value={editFormData.billingPeriod} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent Amount</label>
              <input name="rentAmount" type="number" value={editFormData.rentAmount} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Electricity Charges</label>
              <input name="electricityCharges" type="number" value={editFormData.electricityCharges} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjustments</label>
              <input name="adjustments" type="number" value={editFormData.adjustments} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
              <input name="totalAmount" type="number" value={editFormData.totalAmount} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="paymentStatus" value={editFormData.paymentStatus} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </select>
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
  const ViewBillModal = () => {
    if (!selectedBill) return null;
    const tenant = tenants.find(t => t.id === selectedBill.tenantId);
    const electricityUnits = selectedBill.electricityReading - (tenant?.electricityJoiningReading || 0);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bill Details</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Tenant:</strong> {tenant ? tenant.name : selectedBill.tenantId}</div>
              <div><strong>Room:</strong> {tenant ? tenant.roomNumber : '-'}</div>
              <div><strong>Billing Period:</strong> {selectedBill.billingPeriod}</div>
              <div><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBill.paymentStatus)}`}>
                  {selectedBill.paymentStatus}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Bill Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monthly Rent:</span>
                  <span className="font-medium">{formatCurrency(selectedBill.rentAmount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-blue-700">
                    <span>Electricity ({electricityUnits} units × ₹12):</span>
                    <span className="font-medium">{formatCurrency(selectedBill.electricityCharges)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Joining Reading: {tenant?.electricityJoiningReading || 0} | Current Reading: {selectedBill.electricityReading}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Adjustments:</span>
                  <span className="font-medium">{formatCurrency(selectedBill.adjustments)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Amount:</span>
                  <span className="text-lg">{formatCurrency(selectedBill.totalAmount)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Bill Date:</strong> {formatDateDDMMYYYY(selectedBill.billDate)}</div>
              <div><strong>Due Date:</strong> {formatDateDDMMYYYY(selectedBill.dueDate)}</div>
            </div>
          </div>
          <div className="flex space-x-3 p-6 pt-0">
            <button onClick={() => setShowViewModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Close</button>
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

  const keyTableFields = [
    { key: 'tenantId', label: 'Tenant' },
    { key: 'billingPeriod', label: 'Period' },
    { key: 'rentAmount', label: 'Rent' },
    { key: 'electricityCharges', label: 'Electricity' },
    { key: 'totalAmount', label: 'Total' },
    { key: 'paymentStatus', label: 'Status' },
  ];

  const handleShareWhatsAppRow = (bill: Bill) => {
    const tenant = tenants.find(t => t.id === bill.tenantId);
    if (!tenant) return;
    const phone = `91${tenant.mobile}`;
    const message = encodeURIComponent(
      `Hi ${tenant.name}, your bill for ${bill.billingPeriod} is ₹${bill.totalAmount}. Please pay by ${bill.dueDate}. Thank you!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
            {loading ? (
              <tr><td colSpan={keyTableFields.length + 1} className="border-b border-gray-200">Loading...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={keyTableFields.length + 1} className="border-b border-gray-200">No bills found.</td></tr>
            ) : bills.map(bill => {
            const tenant = tenants.find(t => t.id === bill.tenantId);
            return (
                <tr key={bill.id} className="hover:bg-blue-50 border-b border-gray-200">
                  {keyTableFields.map(col => {
                    const value = (bill as any)[col.key];
                    if (col.key === 'tenantId') {
                      return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{tenant ? tenant.name : value}</td>;
                    }
                    if (["rentAmount", "electricityCharges", "totalAmount"].includes(col.key)) {
                      return <td key={col.key} className="px-3 py-2 text-right border-r border-gray-200 last:border-r-0">{formatCurrency(Number(value)) ?? ''}</td>;
                    }
                    if (col.key === 'paymentStatus') {
                      return <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'paid' ? 'bg-green-100 text-green-700' : value === 'unpaid' ? 'bg-red-100 text-red-700' : value === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{value}</span></td>;
                    }
                    return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{value ?? ''}</td>;
                  })}
                  <td className="px-3 py-2 flex space-x-2">
                    <button title="View" onClick={() => { setSelectedBill(bill); setShowViewModal(true); }} className="p-1 rounded hover:bg-blue-100"><Eye className="h-4 w-4 text-blue-600" /></button>
                    <button title="Edit" onClick={() => { setSelectedBill(bill); setEditFormData({ ...bill }); setShowEditModal(true); }} className="p-1 rounded hover:bg-yellow-100"><Calendar className="h-4 w-4 text-yellow-600" /></button>
                    <button title="Delete" onClick={async () => {
                      if (window.confirm('Delete this bill?')) {
                        try {
                          console.log('Attempting to delete bill:', bill.id);
                          if (onDeleteBill) {
                            await onDeleteBill(bill.id);
                            console.log('Bill deleted successfully');
                          } else {
                            console.error('onDeleteBill function is not available');
                            alert('Delete function not available');
                          }
                        } catch (error) {
                          console.error('Error deleting bill:', error);
                          alert(`Failed to delete bill: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }
                    }} className="p-1 rounded hover:bg-red-100"><Trash2 className="h-4 w-4 text-red-600" /></button>
                    <button title="Share bill on WhatsApp" onClick={() => handleShareWhatsAppRow(bill)} className="p-1 rounded hover:bg-green-100"><Send className="h-4 w-4 text-green-600" /></button>
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>
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

      {/* Edit Modal */}
      {showEditModal && <EditBillModal />}
      {/* View Modal */}
      {showViewModal && <ViewBillModal />}
    </div>
  );
};

export default BillingManagement;