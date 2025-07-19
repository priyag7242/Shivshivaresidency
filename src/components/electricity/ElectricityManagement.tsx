import React, { useState, useEffect } from 'react';
import { Zap, Plus, Edit, Eye, Loader2, Calculator, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ElectricityReading {
  id: string;
  room_number: string;
  tenant_name: string;
  current_reading: number;
  last_reading: number | null;
  reading_date: string;
  units_consumed: number;
  amount: number;
  is_billed: boolean;
  created_at: string;
}

interface ElectricityStats {
  totalUnits: number;
  totalAmount: number;
  totalCollected: number;
  pendingAmount: number;
  currentMonthUnits: number;
  currentMonthAmount: number;
}

const ElectricityManagement: React.FC = () => {
  const [readings, setReadings] = useState<ElectricityReading[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReading, setSelectedReading] = useState<ElectricityReading | null>(null);
  const [stats, setStats] = useState<ElectricityStats>({
    totalUnits: 0,
    totalAmount: 0,
    totalCollected: 0,
    pendingAmount: 0,
    currentMonthUnits: 0,
    currentMonthAmount: 0
  });

  const [form, setForm] = useState({
    room_number: '',
    tenant_name: '',
    current_reading: 0,
    reading_date: new Date().toISOString().split('T')[0]
  });

  const RATE_PER_UNIT = 12; // ₹12 per unit

  // Fetch tenants and readings
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tenants
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'active')
        .order('room_number');

      if (tenantData) {
        setTenants(tenantData);
      }

      // Fetch electricity readings
      const { data: readingData } = await supabase
        .from('electricity_readings')
        .select('*')
        .order('reading_date', { ascending: false });

      if (readingData) {
        setReadings(readingData);
        calculateStats(readingData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateStats = (data: ElectricityReading[]) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const stats: ElectricityStats = {
      totalUnits: data.reduce((sum, reading) => sum + (reading.units_consumed || 0), 0),
      totalAmount: data.reduce((sum, reading) => sum + (reading.amount || 0), 0),
      totalCollected: data.filter(r => r.is_billed).reduce((sum, reading) => sum + (reading.amount || 0), 0),
      pendingAmount: data.filter(r => !r.is_billed).reduce((sum, reading) => sum + (reading.amount || 0), 0),
      currentMonthUnits: data.filter(r => r.reading_date.startsWith(currentMonth))
        .reduce((sum, reading) => sum + (reading.units_consumed || 0), 0),
      currentMonthAmount: data.filter(r => r.reading_date.startsWith(currentMonth))
        .reduce((sum, reading) => sum + (reading.amount || 0), 0)
    };

    setStats(stats);
  };

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Find the last reading for this room
      const lastReading = readings
        .filter(r => r.room_number === form.room_number)
        .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())[0];

      const unitsConsumed = lastReading 
        ? form.current_reading - lastReading.current_reading
        : 0;

      const amount = unitsConsumed * RATE_PER_UNIT;

      const newReading: Omit<ElectricityReading, 'id' | 'created_at'> = {
        room_number: form.room_number,
        tenant_name: form.tenant_name,
        current_reading: form.current_reading,
        last_reading: lastReading ? lastReading.current_reading : null,
        reading_date: form.reading_date,
        units_consumed: unitsConsumed,
        amount: amount,
        is_billed: false
      };

      const { data, error } = await supabase
        .from('electricity_readings')
        .insert([newReading])
        .select();

      if (error) throw error;

      setForm({
        room_number: '',
        tenant_name: '',
        current_reading: 0,
        reading_date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding reading:', error);
    }
  };

  const handleMarkAsBilled = async (readingId: string) => {
    try {
      const { error } = await supabase
        .from('electricity_readings')
        .update({ is_billed: true })
        .eq('id', readingId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error marking as billed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">Electricity Management</h1>
        <button 
          className="btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reading
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex items-center p-6">
          <div className="p-3 rounded-xl mr-4 bg-blue-100 text-blue-700">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900">{stats.totalUnits}</div>
            <div className="text-sm text-gray-600 mt-1">Total Units</div>
          </div>
        </div>

        <div className="card flex items-center p-6">
          <div className="p-3 rounded-xl mr-4 bg-green-100 text-green-700">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-sm text-gray-600 mt-1">Total Amount</div>
          </div>
        </div>

        <div className="card flex items-center p-6">
          <div className="p-3 rounded-xl mr-4 bg-emerald-100 text-emerald-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalCollected)}</div>
            <div className="text-sm text-gray-600 mt-1">Collected</div>
          </div>
        </div>

        <div className="card flex items-center p-6">
          <div className="p-3 rounded-xl mr-4 bg-red-100 text-red-700">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.pendingAmount)}</div>
            <div className="text-sm text-gray-600 mt-1">Pending</div>
          </div>
        </div>
      </div>

      {/* Current Month Summary */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-800">Current Month Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Units Consumed</div>
            <div className="text-2xl font-bold text-blue-800">{stats.currentMonthUnits}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Amount</div>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(stats.currentMonthAmount)}</div>
          </div>
        </div>
      </div>

      {/* Readings Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-800">Electricity Readings</h2>
        </div>
        <div className="card-body overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : readings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No electricity readings found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reading.room_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.tenant_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.current_reading}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.last_reading || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.units_consumed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(reading.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reading.reading_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reading.is_billed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reading.is_billed ? 'Billed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReading(reading);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!reading.is_billed && (
                          <button
                            onClick={() => handleMarkAsBilled(reading.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Reading Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Electricity Reading</h2>
            <form onSubmit={handleAddReading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <select
                  value={form.room_number}
                  onChange={(e) => {
                    const tenant = tenants.find(t => t.room_number === e.target.value);
                    setForm({
                      ...form,
                      room_number: e.target.value,
                      tenant_name: tenant ? tenant.name : ''
                    });
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="">Select Room</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.room_number}>
                      {tenant.room_number} - {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Reading</label>
                <input
                  type="number"
                  value={form.current_reading}
                  onChange={(e) => setForm({...form, current_reading: Number(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reading Date</label>
                <input
                  type="date"
                  value={form.reading_date}
                  onChange={(e) => setForm({...form, reading_date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Reading Modal */}
      {showViewModal && selectedReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Reading Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Room:</span>
                <span>{selectedReading.room_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tenant:</span>
                <span>{selectedReading.tenant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Reading:</span>
                <span>{selectedReading.current_reading}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Reading:</span>
                <span>{selectedReading.last_reading || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Units Consumed:</span>
                <span>{selectedReading.units_consumed}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-semibold text-green-600">{formatCurrency(selectedReading.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Rate:</span>
                <span>₹{RATE_PER_UNIT} per unit</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{formatDate(selectedReading.reading_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedReading.is_billed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedReading.is_billed ? 'Billed' : 'Pending'}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityManagement; 