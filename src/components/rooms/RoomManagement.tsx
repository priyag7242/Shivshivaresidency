import React, { useState, useRef, useEffect } from 'react';
import { Building, Plus, Loader2, Users, BedSingle, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Room } from '../../types';
import { supabase } from '../../lib/supabase';
import { getFloorLabel, formatDateDDMMYYYY } from '../../utils/calculations';

interface RoomManagementProps {
  rooms: Room[];
  onUpdateRoom: (id: string, updates: Partial<Room>) => Promise<Room>;
  onAddRoom: (roomData: Omit<Room, 'id'>) => Promise<Room>;
  loading: boolean;
}

interface RoomWithTenants {
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number;
  rent_amount: number;
  status: string;
  tenants: any[];
  total_rent: number;
  total_deposit: number;
  active_tenants: number;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ rooms, onUpdateRoom, onAddRoom, loading }) => {
  const { tenants, deleteRoom, error } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [roomData, setRoomData] = useState<RoomWithTenants[]>([]);
  const [roomLoading, setRoomLoading] = useState(true);
  
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

  // Fetch room data with tenant information
  const fetchRoomData = async () => {
    setRoomLoading(true);
    try {
      // Get all unique room numbers from tenants
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .order('room_number');

      if (tenantError) throw tenantError;

      // If no tenants found, create sample room data
      if (!tenantData || tenantData.length === 0) {
        const sampleRooms: RoomWithTenants[] = [
          {
            room_number: '101',
            floor: 1,
            room_type: 'single',
            capacity: 1,
            rent_amount: 8000,
            status: 'vacant',
            tenants: [],
            total_rent: 0,
            total_deposit: 0,
            active_tenants: 0
          },
          {
            room_number: '102',
            floor: 1,
            room_type: 'double',
            capacity: 2,
            rent_amount: 12000,
            status: 'vacant',
            tenants: [],
            total_rent: 0,
            total_deposit: 0,
            active_tenants: 0
          },
          {
            room_number: '201',
            floor: 2,
            room_type: 'single',
            capacity: 1,
            rent_amount: 8500,
            status: 'vacant',
            tenants: [],
            total_rent: 0,
            total_deposit: 0,
            active_tenants: 0
          }
        ];
        setRoomData(sampleRooms);
        setRoomLoading(false);
        return;
      }

      // Group tenants by room number
      const roomGroups = tenantData.reduce((acc: any, tenant: any) => {
        const roomNumber = tenant.room_number;
        if (!acc[roomNumber]) {
          acc[roomNumber] = {
            room_number: roomNumber,
            floor: getFloorLabel(roomNumber),
            room_type: 'single', // Default, can be enhanced
            capacity: 1, // Default, can be enhanced
            rent_amount: 0,
            status: 'vacant',
            tenants: [],
            total_rent: 0,
            total_deposit: 0,
            active_tenants: 0
          };
        }
        
        acc[roomNumber].tenants.push(tenant);
        acc[roomNumber].total_rent += tenant.monthly_rent || 0;
        acc[roomNumber].total_deposit += tenant.security_deposit || 0;
        
        if (tenant.status === 'active') {
          acc[roomNumber].active_tenants++;
          acc[roomNumber].status = 'occupied';
        }
        
        return acc;
      }, {});

      // Convert to array and sort
      const roomArray = Object.values(roomGroups).sort((a: any, b: any) => 
        a.room_number.localeCompare(b.room_number, undefined, { numeric: true })
      ) as RoomWithTenants[];

      setRoomData(roomArray);
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setRoomLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [tenants]);

  // Dashboard stats based on actual tenant data
  const totalRooms = roomData.length;
  const occupiedRooms = roomData.filter(r => r.status === 'occupied').length;
  const vacantRooms = roomData.filter(r => r.status === 'vacant').length;
  const totalRent = roomData.reduce((sum, r) => sum + r.total_rent, 0);
  const totalDeposit = roomData.reduce((sum, r) => sum + r.total_deposit, 0);
  const totalActiveTenants = roomData.reduce((sum, r) => sum + r.active_tenants, 0);

  // Group rooms by floor (string label)
  const roomsByFloor = roomData.reduce((acc, room) => {
    const floor = room.floor || '';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<string, typeof roomData>);
  // Sort floors: Ground Floor first, then Floor 1, Floor 2, ...
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => {
    if (a === 'Ground Floor') return -1;
    if (b === 'Ground Floor') return 1;
    // Extract number from 'Floor X'
    const numA = parseInt(a.replace(/[^\d]/g, ''));
    const numB = parseInt(b.replace(/[^\d]/g, ''));
    return (numA || 0) - (numB || 0);
  });

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
      fetchRoomData(); // Refresh data
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
      fetchRoomData(); // Refresh data
    } catch (err: any) {
      setFormError(err.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this room?')) {
      await deleteRoom(id);
      fetchRoomData(); // Refresh data
    }
  };

  const keyTableFields = [
    { key: 'room_number', label: 'Room' },
    { key: 'tenants', label: 'Tenants' },
    { key: 'floor', label: 'Floor' },
    { key: 'total_rent', label: 'Total Rent' },
    { key: 'total_deposit', label: 'Total Deposit' },
    { key: 'status', label: 'Status' },
  ];

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
          <Users className="h-8 w-8 text-purple-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{totalActiveTenants}</div>
            <div className="text-sm text-gray-600">Active Tenants</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Building className="h-8 w-8 text-green-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{formatCurrency(totalRent)}</div>
            <div className="text-sm text-gray-600">Total Monthly Rent</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
          <Building className="h-8 w-8 text-yellow-600 mr-4" />
          <div>
            <div className="text-2xl font-bold">{formatCurrency(totalDeposit)}</div>
            <div className="text-sm text-gray-600">Total Security Deposit</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-neutral-900">Rooms</h1>
        <div className="flex gap-2">
          <button 
            className="btn-secondary flex items-center" 
            onClick={fetchRoomData}
            disabled={roomLoading}
          >
            <Loader2 className={`h-4 w-4 mr-2 ${roomLoading ? 'animate-spin' : ''}`} />
            {roomLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn-primary flex items-center" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </button>
        </div>
      </div>
      {/* Floor Navigation Bar */}
      <div className="flex flex-wrap gap-2 mb-4 sticky top-0 z-20 bg-gray-50 py-2 px-2 rounded shadow">
        {sortedFloors.map(floor => (
          <button
            key={floor}
            onClick={() => scrollToFloor(parseInt(floor.replace(/[^\d]/g, '')))}
            className="flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold shadow-sm hover:bg-blue-200 transition-colors"
          >
            <span className="mr-2">🏢</span> {floor}
            <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{roomsByFloor[floor].length}</span>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">Room List</h2>
          <div className="text-sm text-gray-500">
            {roomLoading ? 'Loading...' : `${roomData.length} rooms found`}
          </div>
        </div>
        <div className="card-body overflow-x-auto">
          
          {roomLoading ? (
            <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : roomData.length === 0 ? (
            <div className="text-gray-500">
              <p>No rooms found.</p>
              <p className="text-sm mt-2">This could mean:</p>
              <ul className="text-sm mt-1 list-disc list-inside">
                <li>No tenants have been added to the database yet</li>
                <li>The SQL commands haven't been executed in Supabase</li>
                <li>There's a connection issue with the database</li>
              </ul>
              <button 
                className="mt-3 btn-secondary text-sm"
                onClick={() => {
                  console.log('Manual refresh triggered');
                  fetchRoomData();
                }}
              >
                Try Again
              </button>
            </div>
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
                        ref={el => (floorRefs.current[parseInt(floor.replace(/[^\d]/g, ''))] = el)}
                        className="sticky top-12 z-10 bg-blue-200 shadow-md cursor-pointer"
                        onClick={() => toggleFloor(parseInt(floor.replace(/[^\d]/g, '')))}
                      >
                        <td colSpan={keyTableFields.length + 1} className="font-bold text-xl px-3 py-4 border-b border-blue-300 flex items-center text-blue-900">
                          <span className="mr-2">🏢</span> {floor}
                          <span className="ml-4 text-xs bg-white text-blue-700 rounded-full px-2 py-0.5 font-bold">{roomsByFloor[floor].length} rooms</span>
                          <span className="ml-4 text-xs text-blue-700">{collapsedFloors[parseInt(floor.replace(/[^\d]/g, ''))] ? '(Show)' : '(Hide)'}</span>
                        </td>
                      </tr>
                    ];
                    if (!collapsedFloors[parseInt(floor.replace(/[^\d]/g, ''))]) {
                      rows.push(...roomsByFloor[floor].map((room, idx) => (
                        <tr key={room.room_number} className={`hover:bg-blue-50 border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          {keyTableFields.map(col => {
                            if (col.key === 'tenants') {
                              if (room.tenants.length === 0) {
                                return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-gray-500">Vacant</td>;
                              } else {
                                const tenantNames = room.tenants.map((t: any) => t.name).join(', ');
                                return <td key={col.key} className="px-3 py-2 whitespace-nowrap border-r border-gray-200 last:border-r-0" title={tenantNames}>
                                  {room.tenants.length} tenant{room.tenants.length > 1 ? 's' : ''}
                                </td>;
                              }
                            }
                            if (col.key === 'total_rent') {
                              return <td key={col.key} className="px-3 py-2 text-right border-r border-gray-200 last:border-r-0 font-medium">{formatCurrency(room.total_rent)}</td>;
                            }
                            if (col.key === 'total_deposit') {
                              return <td key={col.key} className="px-3 py-2 text-right border-r border-gray-200 last:border-r-0 font-medium">{formatCurrency(room.total_deposit)}</td>;
                            }
                            if (col.key === 'status') {
                              return (
                                <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    room.status === 'vacant'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : room.status === 'occupied'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {room.status}
                                  </span>
                                </td>
                              );
                            }
                                                         return <td key={col.key} className="px-3 py-2 border-r border-gray-200 last:border-r-0">{(room as any)[col.key] ?? ''}</td>;
                          })}
                          <td className="px-3 py-2 border-r border-gray-200 last:border-r-0">
                            <button
                              onClick={() => handleView(room)}
                              className="text-gray-600 hover:text-gray-900 mr-2"
                              title="View Room Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )));
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

      {/* View Room Modal with Tenant Details */}
      {showViewModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Room Details: {selectedRoom.room_number}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Room Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Room Number:</span>
                    <span>{selectedRoom.room_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Floor:</span>
                    <span>{selectedRoom.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedRoom.status === 'vacant' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{selectedRoom.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Rent:</span>
                    <span className="font-semibold">{formatCurrency(selectedRoom.total_rent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Deposit:</span>
                    <span className="font-semibold">{formatCurrency(selectedRoom.total_deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Capacity:</span>
                    <span>{selectedRoom.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Current Occupancy:</span>
                    <span>{selectedRoom.tenants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Vacant Seats:</span>
                    <span>{selectedRoom.capacity - selectedRoom.tenants.length}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Tenants ({selectedRoom.tenants.length})</h3>
                {selectedRoom.tenants.length === 0 ? (
                  <p className="text-gray-500">No tenants assigned to this room.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedRoom.tenants.map((tenant: any, index: number) => (
                      <div key={tenant.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-gray-600">Mobile: {tenant.mobile}</div>
                        <div className="text-sm text-gray-600">Rent: {formatCurrency(tenant.monthly_rent)}</div>
                        <div className="text-sm text-gray-600">Food: <span className={tenant.has_food ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{tenant.has_food ? 'Yes' : 'No'}</span></div>
                        <div className="text-sm text-gray-600">Deposit: {formatCurrency(tenant.security_deposit)}</div>
                        <div className="text-sm text-gray-600">Status: 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                            tenant.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                            tenant.status === 'due' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{tenant.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button type="button" onClick={() => setShowViewModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
