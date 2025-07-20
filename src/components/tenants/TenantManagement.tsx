import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { formatCurrency, formatDateDDMMYYYY } from '../../utils/calculations';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const initialForm: Record<string, any> = {
      name: '',
      mobile: '',
  room_number: '',
  joining_date: '',
  monthly_rent: '',
  security_deposit: '',
  electricity_joining_reading: '',
  last_electricity_reading: '',
        status: 'active',
  created_date: '',
  has_food: false,
  category: '',
  departure_date: '',
  stay_duration: '',
  notice_given: false,
  notice_date: '',
  security_adjustment: '',
};

// Updated table fields to match your requirements
const keyTableFields = [
  { key: 'room_number', label: 'Room Number' },
  { key: 'name', label: 'Name' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'joining_date', label: 'Joining Date' },
  { key: 'monthly_rent', label: 'Rent' },
  { key: 'security_deposit', label: 'Deposit' },
  { key: 'status', label: 'Status' },
  { key: 'stay_status', label: 'Stay/Leaving' },
];

const groupFields = [
  { label: 'Personal Info', fields: ['name', 'mobile', 'category', 'status'] },
  { label: 'Room Info', fields: ['room_number', 'joining_date', 'departure_date', 'stay_duration'] },
  { label: 'Financials', fields: ['monthly_rent', 'security_deposit', 'security_adjustment'] },
  { label: 'Electricity', fields: ['electricity_joining_reading', 'last_electricity_reading'] },
  { label: 'Other', fields: ['has_food', 'notice_given', 'notice_date', 'created_date'] },
];

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState<any>(null);
  const [editTenant, setEditTenant] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tenants from Supabase
  const fetchTenants = async () => {
    setLoading(true);
    let query = supabase.from('tenants').select('*');
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (!error) setTenants(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line
  }, [searchTerm, statusFilter]);

  // Dashboard stats
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const noSecurityDeposit = tenants.filter(t => !t.security_deposit || t.security_deposit === 0).length;
  const noticeGiven = tenants.filter(t => t.notice_given).length;

  // Add Tenant logic
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    if (!form.name || !form.mobile || !form.room_number) {
      setFormError('Name, Mobile, and Room Number are required.');
      setSubmitting(false);
      return;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      setFormError('Mobile must be a 10-digit number.');
      setSubmitting(false);
      return;
    }
    if (form.monthly_rent && isNaN(Number(form.monthly_rent))) {
      setFormError('Monthly Rent must be a number.');
      setSubmitting(false);
      return;
    }
    // Validate stay_duration: allow 1, 2, 3 months or "unknown"
    if (form.stay_duration === '') {
      setFormError('Stay Duration is required.');
      setSubmitting(false);
      return;
    }
    if (form.stay_duration !== 'unknown' && (isNaN(Number(form.stay_duration)) || ![1, 2, 3].includes(Number(form.stay_duration)))) {
      setFormError('Stay Duration must be 1, 2, 3 months, or "unknown" for longer stays.');
      setSubmitting(false);
      return;
    }
    const cleanNumber = (val: string) => val === '' ? null : val === 'unknown' ? 'unknown' : Number(val);
    const payload = {
      ...form,
      stay_duration: cleanNumber(form.stay_duration),
      monthly_rent: cleanNumber(form.monthly_rent),
      security_deposit: cleanNumber(form.security_deposit),
      security_adjustment: cleanNumber(form.security_adjustment),
      electricity_joining_reading: cleanNumber(form.electricity_joining_reading),
      last_electricity_reading: cleanNumber(form.last_electricity_reading),
    };
    const { error } = await supabase.from('tenants').insert([payload]);
    if (error) setFormError(error.message);
    else {
      setForm(initialForm);
      setShowAdd(false);
      fetchTenants();
    }
    setSubmitting(false);
  };

  // Edit logic
  const handleEdit = (tenant: any) => {
    setEditTenant(tenant);
    setForm({ ...tenant });
    setShowEdit(true);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    if (!form.name || !form.mobile || !form.room_number) {
      setFormError('Name, Mobile, and Room Number are required.');
      setSubmitting(false);
      return;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      setFormError('Mobile must be a 10-digit number.');
      setSubmitting(false);
      return;
    }
    if (form.monthly_rent && isNaN(Number(form.monthly_rent))) {
      setFormError('Monthly Rent must be a number.');
      setSubmitting(false);
      return;
    }
    // Validate stay_duration: allow 1, 2, 3 months or "unknown"
    if (form.stay_duration === '') {
      setFormError('Stay Duration is required.');
      setSubmitting(false);
      return;
    }
    if (form.stay_duration !== 'unknown' && (isNaN(Number(form.stay_duration)) || ![1, 2, 3].includes(Number(form.stay_duration)))) {
      setFormError('Stay Duration must be 1, 2, 3 months, or "unknown" for longer stays.');
      setSubmitting(false);
      return;
    }
    const cleanNumber = (val: string) => val === '' ? null : val === 'unknown' ? 'unknown' : Number(val);
    const payload = {
      ...form,
      stay_duration: cleanNumber(form.stay_duration),
      monthly_rent: cleanNumber(form.monthly_rent),
      security_deposit: cleanNumber(form.security_deposit),
      security_adjustment: cleanNumber(form.security_adjustment),
      electricity_joining_reading: cleanNumber(form.electricity_joining_reading),
      last_electricity_reading: cleanNumber(form.last_electricity_reading),
    };
    const { error } = await supabase.from('tenants').update({ ...payload }).eq('id', editTenant.id);
    if (error) setFormError(error.message);
    else {
      setShowEdit(false);
      setEditTenant(null);
      fetchTenants();
    }
    setSubmitting(false);
  };
  // Delete logic
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      await supabase.from('tenants').delete().eq('id', id);
      fetchTenants();
    }
  };
  // View logic
  const handleView = (tenant: any) => {
    setShowView(tenant);
  };

  // Filtered tenants (by name, room_number, status, category)
  const filteredTenants = tenants.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate status counts and only show statuses that have tenants
  const allStatuses = ['all', 'active', 'paid', 'due', 'adjust', 'departing', 'left', 'pending', 'terminated', 'inactive', 'hold', 'prospective'];
  const statusCounts = Object.fromEntries(
    allStatuses.map(status => [
      status,
      status === 'all' ? tenants.length : tenants.filter(t => t.status === status).length
    ])
  );

  // Only show status filters that have tenants (count > 0) or 'all'
  const availableStatuses = allStatuses.filter(status => 
    status === 'all' || statusCounts[status] > 0
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Cards - Only show statuses with tenants */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {availableStatuses.map(status => (
          <div
            key={status}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition ${statusFilter === status ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            <span className="text-2xl font-bold mb-1">{statusCounts[status]}</span>
            <span className="text-xs text-gray-600 capitalize">{status}</span>
          </div>
        ))}
        </div>

      {/* Search Bar and Add Tenant */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search tenants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input w-full md:w-1/2"
        />
        <button className="btn-primary flex items-center" onClick={() => setShowAdd(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Tenant
            </button>
      </div>

      {/* Status Filter Tabs - Only show available statuses */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map(status => (
            <button
              key={status}
              className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize transition-colors ${statusFilter === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} <span className="ml-1 text-xs font-normal">({statusCounts[status]})</span>
            </button>
          ))}
        </div>
        {/* Dropdown (for mobile/compact) */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input ml-2"
        >
          {availableStatuses.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Tenants Table with Key Fields Only */}
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
            ) : filteredTenants.length === 0 ? (
              <tr><td colSpan={keyTableFields.length + 1} className="border-b border-gray-200">No tenants found.</td></tr>
            ) : filteredTenants.map(tenant => (
              <tr key={tenant.id} className={`hover:bg-blue-50 border-b border-gray-200 ${(() => { const dep = tenant.departure_date ? new Date(tenant.departure_date) : null; const now = new Date(); return dep && dep.getFullYear() === now.getFullYear() && dep.getMonth() === now.getMonth() ? 'bg-red-50' : '' })()}`}>
                {keyTableFields.map(col => {
                  let value = tenant[col.key];
                  if (col.key === 'joining_date' && value) {
                    // Format date as DD-MM-YYYY
                    const d = new Date(value);
                    value = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()}`;
                  }
                  if (col.key === 'monthly_rent' || col.key === 'security_deposit') {
                    return <td key={col.key} className="px-3 py-2 text-right border-r border-gray-200 last:border-r-0">{formatCurrency(value || 0)}</td>;
                  }
                  if (col.key === 'status') {
                    return <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      value === 'active' ? 'bg-green-100 text-green-700' :
                      value === 'paid' ? 'bg-blue-100 text-blue-700' :
                      value === 'due' ? 'bg-red-100 text-red-700' :
                      value === 'adjust' ? 'bg-yellow-100 text-yellow-700' :
                      value === 'departing' ? 'bg-orange-100 text-orange-700' :
                      value === 'left' ? 'bg-gray-200 text-gray-700' :
                      value === 'pending' ? 'bg-blue-100 text-blue-700' :
                      value === 'terminated' ? 'bg-red-100 text-red-700' :
                      value === 'inactive' ? 'bg-gray-100 text-gray-500' :
                      value === 'hold' ? 'bg-yellow-100 text-yellow-700' :
                      value === 'prospective' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{value}</span></td>;
                  }
                  if (col.key === 'stay_status') {
                    const now = new Date();
                    const dep = tenant.departure_date ? new Date(tenant.departure_date) : null;
                    const isLeaving = dep && dep.getFullYear() === now.getFullYear() && dep.getMonth() === now.getMonth();
                    return <td key={col.key} className={`px-3 py-2 border-r border-gray-200 last:border-r-0 font-semibold ${isLeaving ? 'text-red-600' : 'text-green-600'}`}>{isLeaving ? 'Leaving this month' : 'Stay'}</td>;
                  }
                  return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{value ?? ''}</td>;
                })}
                <td className="px-3 py-2">
                  <button onClick={() => handleEdit(tenant)} className="btn btn-outline mr-2"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(tenant.id)} className="btn btn-outline text-red-600 mr-2"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => handleView(tenant)} className="btn btn-outline"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Tenant Modal with Grouped Fields */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Add Tenant</h2>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              {groupFields.map(group => (
                <div key={group.label} className="mb-4 bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-3 text-gray-700">{group.label}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map(key => (
                      <div key={key} className="flex flex-col">
                        <label className="font-medium mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        {typeof initialForm[key] === 'boolean' ? (
                          <input
                            type="checkbox"
                            name={key}
                            checked={!!form[key]}
                            onChange={e => setForm({ ...form, [key]: e.target.checked })}
                            className="h-4 w-4"
                          />
                        ) : key === 'stay_duration' ? (
                          <select
                            name={key}
                            value={form[key] ?? ''}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="input"
                            required
                          >
                            <option value="">Select Stay Duration</option>
                            <option value="1">1 Month</option>
                            <option value="2">2 Months</option>
                            <option value="3">3 Months</option>
                            <option value="6">6 Months</option>
                            <option value="unknown">Unknown (Longer Stay)</option>
                            <option value="1_month">1 Month (Legacy)</option>
                            <option value="2_months">2 Months (Legacy)</option>
                            <option value="3_months">3 Months (Legacy)</option>
                            <option value="6_months">6 Months (Legacy)</option>
                            <option value="indefinite">Indefinite</option>
                          </select>
                        ) : (
                          <input
                            type={key.toLowerCase().includes('date') ? 'date' : (typeof initialForm[key] === 'number' ? 'number' : 'text')}
                            name={key}
                            value={form[key] ?? ''}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="input"
                          />
                        )}
                      </div>
                    ))}
                </div>
                </div>
              ))}
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Add'}</button>
              </div>
            </form>
              </div>
            </div>
      )}

      {/* Edit Tenant Modal with Grouped Fields */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Edit Tenant</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {groupFields.map(group => (
                <div key={group.label} className="mb-4 bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-3 text-gray-700">{group.label}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map(key => (
                      <div key={key} className="flex flex-col">
                        <label className="font-medium mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        {typeof initialForm[key] === 'boolean' ? (
                          <input
                            type="checkbox"
                            name={key}
                            checked={!!form[key]}
                            onChange={e => setForm({ ...form, [key]: e.target.checked })}
                            className="h-4 w-4"
                          />
                        ) : key === 'stay_duration' ? (
                          <select
                            name={key}
                            value={form[key] ?? ''}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="input"
                            required
                          >
                            <option value="">Select Stay Duration</option>
                            <option value="1">1 Month</option>
                            <option value="2">2 Months</option>
                            <option value="3">3 Months</option>
                            <option value="6">6 Months</option>
                            <option value="unknown">Unknown (Longer Stay)</option>
                            <option value="1_month">1 Month (Legacy)</option>
                            <option value="2_months">2 Months (Legacy)</option>
                            <option value="3_months">3 Months (Legacy)</option>
                            <option value="6_months">6 Months (Legacy)</option>
                            <option value="indefinite">Indefinite</option>
                          </select>
                        ) : (
                          <input
                            type={key.toLowerCase().includes('date') ? 'date' : (typeof initialForm[key] === 'number' ? 'number' : 'text')}
                            name={key}
                            value={form[key] ?? ''}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="input"
                          />
                        )}
                      </div>
                    ))}
                  </div>
              </div>
              ))}
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setShowEdit(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
              </div>
      )}

      {/* View Tenant Modal with All Details */}
      {showView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Tenant Details</h2>
            <div className="space-y-2 text-xs">
              {groupFields.map(group => (
                <div key={group.label} className="mb-4 bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-3 text-gray-700">{group.label}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map(key => (
                      <div key={key} className="flex flex-col">
                        <span className="font-medium mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="text-gray-700">
                          {typeof showView[key] === 'boolean' ? showView[key]?.toString() : 
                           key === 'stay_duration' ? 
                             (showView[key] === 'unknown' ? 'Unknown' : 
                              (showView[key] && !isNaN(Number(showView[key])) ? 
                               `${showView[key]} month${Number(showView[key]) > 1 ? 's' : ''}` : 
                               showView[key] ?? '')) :
                           showView[key] ?? ''}
                        </span>
                      </div>
                    ))}
              </div>
              </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setShowView(null)} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;