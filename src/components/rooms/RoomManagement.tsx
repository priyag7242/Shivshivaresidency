import React, { useState, useRef } from 'react';
import { Building, Plus, Loader2, Wrench, Users, BedDouble, BedSingle, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Room } from '../../types';

interface RoomManagementProps {
  rooms: Room[];
  onUpdateRoom: (id: string, updates: Partial<Room>) => Promise<Room>;
  onAddRoom: (roomData: Omit<Room, 'id'>) => Promise<Room>;
  loading: boolean;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ rooms, onUpdateRoom, onAddRoom, loading }) => {
  const { tenants, deleteRoom, error } = useData();
  const [showAdd, setShowAdd] = useState(false);
  // Change form state to Record<string, any>
  const [form, setForm] = useState<Record<string, any>>({
    roomNumber: '',
    roomType: 'single',
    floor: 1,
    capacity: 1,
    rentAmount: 0,
    status: 'vacant',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Dashboard stats
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = rooms.filter(r => r.status === 'vacant').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const singleRooms = rooms.filter(r => r.roomType === 'single').length;
  const doubleRooms = rooms.filter(r => r.roomType === 'double').length;
  const tripleRooms = rooms.filter(r => r.roomType === 'triple').length;
  const quadRooms = rooms.filter(r => r.roomType === 'quad').length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 1), 0);
  const usedCapacity = rooms.filter(r => r.status === 'occupied').reduce((sum, r) => sum + (r.capacity || 1), 0);
  const capacityUtilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor || 0;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, typeof rooms>);
  const sortedFloors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);

  // Collapsible floors state
  const [collapsedFloors, setCollapsedFloors] = useState<Record<number, boolean>>({});
  const toggleFloor = (floor: number) => {
    setCollapsedFloors(prev => ({ ...prev, [floor]: !prev[floor] }));
  };

  // Floor refs for scrolling
  const floorRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const scrollToFloor = (floor: number) => {
    const ref = floorRefs.current[floor];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      await onAddRoom({
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

  const handleEdit = (room: any) => {
    setSelectedRoom(room);
    setEditForm({ ...room });
    setShowEditModal(true);
  };
  const handleView = (room: any) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'floor' || name === 'capacity' || name === 'rentAmount' ? Number(value) : value,
    }));
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onUpdateRoom(selectedRoom.id, editForm);
      setShowEditModal(false);
      setSelectedRoom(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this room?')) {
      await deleteRoom(id);
    }
  };

  const keyTableFields = [
    { key: 'roomNumber', label: 'Room' },
    { key: 'tenant', label: 'Tenant' },
    { key: 'floor', label: 'Floor' },
    { key: 'roomType', label: 'Type' },
    { key: 'rentAmount', label: 'Rent' },
    { key: 'status', label: 'Status' },
  ];

  // Define field groups for modals
  const groupFields = [
    { label: 'Room Info', fields: ['roomNumber', 'roomType', 'floor', 'capacity', 'rentAmount'] },
    { label: 'Status', fields: ['status'] },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Building className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Users className="h-8 w-8 text-green-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{occupiedRooms}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Building className="h-8 w-8 text-yellow-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{vacantRooms}</div>
            <div className="text-sm text-gray-600">Vacant</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Wrench className="h-8 w-8 text-red-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{maintenanceRooms}</div>
            <div className="text-sm text-gray-600">Under Maintenance</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <BedSingle className="h-8 w-8 text-blue-400 mr-4" />
          <div>
            <div className="text-2xl font-bold">{singleRooms}</div>
            <div className="text-sm text-gray-600">Single Rooms</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <BedDouble className="h-8 w-8 text-green-400 mr-4" />
          <div>
            <div className="text-2xl font-bold">{doubleRooms}</div>
            <div className="text-sm text-gray-600">Double Rooms</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <BedDouble className="h-8 w-8 text-yellow-400 mr-4" />
          <div>
            <div className="text-2xl font-bold">{tripleRooms}</div>
            <div className="text-sm text-gray-600">Triple Rooms</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <BedDouble className="h-8 w-8 text-purple-400 mr-4" />
          <div>
            <div className="text-2xl font-bold">{quadRooms}</div>
            <div className="text-sm text-gray-600">Quad Rooms</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Users className="h-8 w-8 text-indigo-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Users className="h-8 w-8 text-pink-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{usedCapacity}</div>
            <div className="text-sm text-gray-600">Used Capacity</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Users className="h-8 w-8 text-cyan-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{capacityUtilization}%</div>
            <div className="text-sm text-gray-600">Capacity Utilization</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-neutral-900">Rooms</h1>
        <button className="btn-primary flex items-center" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Room
        </button>
      </div>
      {/* Floor Navigation Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sticky top-0 z-20 bg-gray-50 py-2 px-2 rounded shadow">
        {sortedFloors.map(floor => (
          <button
            key={floor}
            onClick={() => scrollToFloor(floor)}
            className="flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold shadow-sm hover:bg-blue-200 transition-colors"
          >
            <span className="mr-2">🏢</span> Floor {floor}
            <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{roomsByFloor[floor].length}</span>
          </button>
        ))}
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
                  {sortedFloors.flatMap(floor => {
                    const rows = [
                      <tr
                        key={`floor-header-${floor}`}
                        ref={el => (floorRefs.current[floor] = el)}
                        className="sticky top-12 z-10 bg-blue-200 shadow-md cursor-pointer"
                        onClick={() => toggleFloor(floor)}
                      >
                        <td colSpan={keyTableFields.length + 1} className="font-bold text-xl px-3 py-4 border-b border-blue-300 flex items-center text-blue-900">
                          <span className="mr-2">🏢</span> Floor {floor}
                          <span className="ml-4 text-xs bg-white text-blue-700 rounded-full px-2 py-0.5 font-bold">{roomsByFloor[floor].length} rooms</span>
                          <span className="ml-4 text-xs text-blue-700">{collapsedFloors[floor] ? '(Show)' : '(Hide)'}</span>
                        </td>
                      </tr>
                    ];
                    if (!collapsedFloors[floor]) {
                      rows.push(...roomsByFloor[floor].map((room, idx) => {
                        const tenant = tenants.find(t => t.id === room.tenantId);
                        return (
                          <tr key={room.id} className={`hover:bg-blue-50 border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            {keyTableFields.map(col => {
                              if (col.key === 'tenant') {
                                if (room.status === 'vacant') {
                                  return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">Vacant</td>;
                                } else if (room.status === 'occupied') {
                                  return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">{tenant ? tenant.name : 'Unassigned'}</td>;
                                } else if (room.status === 'maintenance') {
                                  return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>;
                                } else {
                                  return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>;
                                }
                              }
                              let value = (room as any)[col.key];
                              if (col.key === 'rentAmount') {
                                return <td key={col.key} className="px-3 py-2 text-right border-r border-gray-200 last:border-r-0">{value ?? ''}</td>;
                              }
                              if (col.key === 'status') {
                                return (
                                  <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      value === 'vacant'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : value === 'occupied'
                                        ? 'bg-green-100 text-green-700'
                                        : value === 'maintenance'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {value}
                                    </span>
                                  </td>
                                );
                              }
                              return <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0">{value ?? ''}</td>;
                            })}
                            <td className="px-3 py-2 border-r border-gray-200 last:border-r-0">
                              <button
                                onClick={() => handleEdit(room)}
                                className="text-blue-600 hover:text-blue-900 mr-2"
                                title="Edit Room"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleView(room)}
                                className="text-gray-600 hover:text-gray-900"
                                title="View Room"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(room.id)}
                                className="text-red-600 hover:text-red-900 ml-2"
                                title="Delete Room"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      }));
                    }
                    return rows;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Room</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  id="roomType"
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>
              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700">Floor</label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  value={form.floor}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700">Rent Amount</label>
                <input
                  type="number"
                  id="rentAmount"
                  name="rentAmount"
                  value={form.rentAmount}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
              {formError && <div className="text-red-600">{formError}</div>}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {submitting ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Room: {selectedRoom.roomNumber}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="editRoomNumber" className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  id="editRoomNumber"
                  name="roomNumber"
                  value={editForm.roomNumber}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="editRoomType" className="block text-sm font-medium text-gray-700">Room Type</label>
                <select
                  id="editRoomType"
                  name="roomType"
                  value={editForm.roomType}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>
              <div>
                <label htmlFor="editFloor" className="block text-sm font-medium text-gray-700">Floor</label>
                <input
                  type="number"
                  id="editFloor"
                  name="floor"
                  value={editForm.floor}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="editCapacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  id="editCapacity"
                  name="capacity"
                  value={editForm.capacity}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="editRentAmount" className="block text-sm font-medium text-gray-700">Rent Amount</label>
                <input
                  type="number"
                  id="editRentAmount"
                  name="rentAmount"
                  value={editForm.rentAmount}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="editStatus"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
              {formError && <div className="text-red-600">{formError}</div>}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {submitting ? 'Updating...' : 'Update Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Room Modal */}
      {showViewModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">View Room: {selectedRoom.roomNumber}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-semibold">Room Number:</span> {selectedRoom.roomNumber}</p>
                <p><span className="font-semibold">Room Type:</span> {selectedRoom.roomType}</p>
                <p><span className="font-semibold">Floor:</span> {selectedRoom.floor}</p>
                <p><span className="font-semibold">Capacity:</span> {selectedRoom.capacity}</p>
                <p><span className="font-semibold">Rent Amount:</span> {selectedRoom.rentAmount}</p>
                <p><span className="font-semibold">Status:</span> {selectedRoom.status}</p>
              </div>
              <div>
                <p><span className="font-semibold">Tenant:</span> {selectedRoom.tenant ? selectedRoom.tenant.name : 'Unassigned'}</p>
                <p><span className="font-semibold">Assigned Since:</span> {selectedRoom.assignedSince ? new Date(selectedRoom.assignedSince).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-semibold">Lease Duration:</span> {selectedRoom.leaseDuration ? `${selectedRoom.leaseDuration} months` : 'N/A'}</p>
                <p><span className="font-semibold">Monthly Rent:</span> {selectedRoom.monthlyRent}</p>
                <p><span className="font-semibold">Deposit:</span> {selectedRoom.deposit}</p>
                <p><span className="font-semibold">Utilities:</span> {selectedRoom.utilities}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setShowViewModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
