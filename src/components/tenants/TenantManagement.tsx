import React, { useState } from 'react';
import { UserPlus, Edit, Loader2 } from 'lucide-react';
import { useData } from '../../hooks/useData';

const TenantManagement: React.FC = () => {
  const { tenants, addTenant, updateTenant, loading, error } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', roomNumber: '', mobile: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (!form.name || !form.roomNumber || !form.mobile) {
        setFormError('All fields are required');
        setSubmitting(false);
        return;
      }
      await addTenant({
        name: form.name,
        roomNumber: form.roomNumber,
        mobile: form.mobile,
        status: 'active',
        joiningDate: new Date().toISOString().split('T')[0],
        monthlyRent: 0,
        securityDeposit: 0,
        electricityJoiningReading: 0,
        createdDate: new Date().toISOString().split('T')[0],
        hasFood: false
      });
      setForm({ name: '', roomNumber: '', mobile: '' });
      setShowAdd(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-neutral-900">Tenants</h1>
        <button className="btn-primary flex items-center" onClick={() => setShowAdd(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Tenant
        </button>
      </div>
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tenant List</h2>
        </div>
        <div className="card-body overflow-x-auto">
          {loading ? (
            <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : tenants.length === 0 ? (
            <div className="text-gray-500">No tenants found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Room</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Mobile</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-blue-50">
                    <td className="px-4 py-2 font-medium">{tenant.name}</td>
                    <td className="px-4 py-2">{tenant.roomNumber}</td>
                    <td className="px-4 py-2">{tenant.mobile}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{tenant.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button className="btn-outline flex items-center text-xs px-2 py-1">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Add Tenant Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowAdd(false)}>&times;</button>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><UserPlus className="h-5 w-5 mr-2" /> Add Tenant</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room Number</label>
                <input name="roomNumber" value={form.roomNumber} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input name="mobile" value={form.mobile} onChange={handleChange} className="input" required />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2 inline" /> : null}
                  Add Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;