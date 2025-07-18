import React, { useState } from 'react';
import { Building, Plus, Loader2 } from 'lucide-react';
import { useData } from '../../hooks/useData';

const RoomManagement: React.FC = () => {
  const { rooms, addRoom, loading, error } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', roomType: 'single' as 'single' | 'double' | 'triple' | 'quad', floor: 1, capacity: 1, rentAmount: 0, status: 'vacant' as 'vacant' | 'occupied' | 'maintenance' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'floor' || name === 'capacity' || name === 'rentAmount'
          ? Number(value)
          : value,
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (!form.roomNumber || !form.roomType) {
        setFormError('Room number and type are required');
        setSubmitting(false);
        return;
      }
      await addRoom({
        roomNumber: form.roomNumber,
        roomType: form.roomType,
        floor: form.floor,
        capacity: form.capacity,
        rentAmount: form.rentAmount,
        status: form.status,
      });
      setForm({ roomNumber: '', roomType: 'single', floor: 1, capacity: 1, rentAmount: 0, status: 'vacant' });
      setShowAdd(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add room');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-neutral-900">Rooms</h1>
        <button className="btn-primary flex items-center" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Room
        </button>
      </div>
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">Room List</h2>
        </div>
        <div className="card-body overflow-x-auto">
          {loading ? (
            <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : rooms.length === 0 ? (
            <div className="text-gray-500">No rooms found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Number</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Floor</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Capacity</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Rent</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-blue-50">
                    <td className="px-4 py-2 font-medium">{room.roomNumber}</td>
                    <td className="px-4 py-2 capitalize">{room.roomType}</td>
                    <td className="px-4 py-2">{room.floor}</td>
                    <td className="px-4 py-2">{room.capacity}</td>
                    <td className="px-4 py-2">₹{room.rentAmount}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${room.status === 'vacant' ? 'badge-info' : room.status === 'occupied' ? 'badge-success' : 'badge-warning'}`}>{room.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Add Room Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowAdd(false)}>&times;</button>
            <h3 className="text-lg font-semibold mb-4 flex items-center"><Building className="h-5 w-5 mr-2" /> Add Room</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Number</label>
                <input name="roomNumber" value={form.roomNumber} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room Type</label>
                <select name="roomType" value={form.roomType} onChange={handleChange} className="input" required>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Floor</label>
                <input name="floor" type="number" value={form.floor} onChange={handleChange} className="input" min={1} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input name="capacity" type="number" value={form.capacity} onChange={handleChange} className="input" min={1} max={4} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rent (₹)</label>
                <input name="rentAmount" type="number" value={form.rentAmount} onChange={handleChange} className="input" min={0} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="input" required>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2 inline" /> : null}
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
