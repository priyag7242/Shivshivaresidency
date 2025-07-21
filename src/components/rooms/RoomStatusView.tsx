import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import EditRoomForm from './EditRoomForm';
import { Room } from '../../types';

interface RoomStatus {
  room_number: string;
  total_tenants: number;
  active_tenants: number;
  paid_tenants: number;
  due_tenants: number;
  adjust_tenants: number;
  departing_tenants: number;
  left_tenants: number;
  pending_tenants: number;
  terminated_tenants: number;
  inactive_tenants: number;
  hold_tenants: number;
  prospective_tenants: number;
  total_rent: number;
  total_deposit: number;
  room_status: string;
  roomType: 'single' | 'double' | 'triple' | 'quad'; // added
  floor: number; // added
  capacity: number; // added
}

interface VacantRoom {
  room_number: string;
  status: string;
  total_tenants: number;
  total_rent: number;
  total_deposit: number;
}

const RoomStatusView: React.FC = () => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [vacantRooms, setVacantRooms] = useState<VacantRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'occupied' | 'vacant'>('occupied');
  const [roomTypeModal, setRoomTypeModal] = useState<string | null>(null);
  const [editedRoomTypes, setEditedRoomTypes] = useState<Record<string, string>>({});
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRoomData();
  }, []);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      
      // Fetch room status data
      const { data: statusData, error: statusError } = await supabase
        .from('room_status_view')
        .select('*')
        .order('room_number');

      if (statusError) throw statusError;

      // Fetch vacant rooms data
      const { data: vacantData, error: vacantError } = await supabase
        .from('vacant_rooms_view')
        .select('*')
        .order('room_number');

      if (vacantError) throw vacantError;

      setRoomStatuses(statusData || []);
      setVacantRooms(vacantData || []);
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'occupied':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vacant':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'adjust':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'departing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'left':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prospective':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleRoomTypeChange = (room: RoomStatus, newType: string) => {
    setEditedRoomTypes(prev => ({ ...prev, [room.room_number]: newType }));
  };

  const saveRoomType = async (room: RoomStatus) => {
    const newType = editedRoomTypes[room.room_number] || room.roomType;
    if (newType === room.roomType) return;
    // Update in Supabase
    const { error } = await supabase
      .from('rooms')
      .update({ roomType: newType })
      .eq('roomNumber', room.room_number);
    if (!error) {
      setRoomStatuses(prev => prev.map(r =>
        r.room_number === room.room_number ? { ...r, roomType: newType as RoomStatus['roomType'] } : r
      ));
      setEditedRoomTypes(prev => {
        const copy = { ...prev };
        delete copy[room.room_number];
        return copy;
      });
    } else {
      alert('Failed to update room type');
    }
  };

  const openEditRoom = (room: RoomStatus) => {
    setEditRoom({
      id: '', // You may want to fetch the real id if available
      roomNumber: room.room_number,
      floor: room.floor,
      roomType: room.roomType,
      capacity: room.capacity,
      rentAmount: room.total_rent,
      status: room.room_status as Room['status'],
    });
  };

  const handleUpdateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id);
    const updatedRoom: Room = { id, roomNumber: updates.roomNumber || '', floor: updates.floor || 0, roomType: updates.roomType || 'single', capacity: updates.capacity || 1, rentAmount: updates.rentAmount || 0, status: updates.status || 'vacant' };
    if (!error) {
      setRoomStatuses(prev => prev.map(r =>
        r.room_number === updates.roomNumber ? { ...r, ...updates, room_number: updates.roomNumber || r.room_number } : r
      ));
      setEditRoom(null);
    } else {
      alert('Failed to update room details');
    }
    return updatedRoom;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Status Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('occupied')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'occupied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Occupied Rooms ({roomStatuses.filter(r => r.room_status !== 'VACANT').length})
          </button>
          <button
            onClick={() => setActiveTab('vacant')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'vacant'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vacant Rooms ({vacantRooms.length})
          </button>
        </div>
      </div>

      {/* Add at the top of the return (after loading check, before tab navigation) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600 text-white rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform">
          <span className="text-4xl font-bold">{roomStatuses.length + vacantRooms.length}</span>
          <span className="mt-2 text-lg font-medium">Total Rooms</span>
        </div>
        <div onClick={() => setActiveTab('occupied')} className="cursor-pointer bg-green-600 text-white rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform">
          <span className="text-4xl font-bold">{roomStatuses.filter(r => r.room_status !== 'VACANT').length}</span>
          <span className="mt-2 text-lg font-medium">Occupied</span>
        </div>
        <div onClick={() => setActiveTab('vacant')} className="cursor-pointer bg-gray-600 text-white rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform">
          <span className="text-4xl font-bold">{vacantRooms.length}</span>
          <span className="mt-2 text-lg font-medium">Vacant</span>
        </div>
        <div className="bg-yellow-500 text-white rounded-xl p-6 flex flex-col items-center shadow">
          <span className="text-4xl font-bold">{roomStatuses.reduce((sum, r) => sum + r.active_tenants, 0)}</span>
          <span className="mt-2 text-lg font-medium">Active Tenants</span>
        </div>
      </div>

      {/* Room Type Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['single','double','triple','quad'].map(type => (
          <button
            key={type}
            onClick={() => setRoomTypeModal(type)}
            className="px-4 py-2 rounded-full border border-blue-400 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
            {' '}({roomStatuses.filter(r => r.roomType === type).length})
          </button>
        ))}
      </div>

      {/* Room Type Modal */}
      {roomTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 relative">
            <button onClick={() => setRoomTypeModal(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <h3 className="text-xl font-bold mb-4">{roomTypeModal.charAt(0).toUpperCase() + roomTypeModal.slice(1)} Rooms</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Room</th>
                  <th className="text-left py-2">Floor</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Capacity</th>
                  <th className="text-left py-2">Edit</th>
                </tr>
              </thead>
              <tbody>
                {roomStatuses.filter(r => r.roomType === roomTypeModal).map(room => (
                  <tr key={room.room_number}>
                    <td className="py-2">{room.room_number}</td>
                    <td className="py-2">{room.floor}</td>
                    <td className="py-2">
                      <select
                        value={editedRoomTypes[room.room_number] ?? room.roomType}
                        onChange={e => handleRoomTypeChange(room, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                        <option value="quad">Quad</option>
                      </select>
                    </td>
                    <td className="py-2">{room.capacity}</td>
                    <td className="py-2">
                      <button onClick={() => saveRoomType(room)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Save</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'occupied' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
            <colgroup>
              <col style={{ width: '10%' }} /> {/* Room */}
              <col style={{ width: '10%' }} /> {/* Status */}
              <col style={{ width: '10%' }} /> {/* Tenants */}
              <col style={{ width: '10%' }} /> {/* Active */}
              <col style={{ width: '10%' }} /> {/* Paid */}
              <col style={{ width: '10%' }} /> {/* Due */}
              <col style={{ width: '8%' }} /> {/* Adjust */}
              <col style={{ width: '8%' }} /> {/* Departing */}
              <col style={{ width: '8%' }} /> {/* Left */}
              <col style={{ width: '8%' }} /> {/* Pending */}
              <col style={{ width: '10%' }} /> {/* Total Rent */}
              <col style={{ width: '10%' }} /> {/* Total Deposit */}
              <col style={{ width: '6%' }} /> {/* Edit */}
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Tenants</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Adjust</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Departing</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Pending</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Rent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Deposit</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roomStatuses
                .filter(room => room.room_status !== 'VACANT')
                .map((room) => (
                  <tr key={room.room_number} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{room.room_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(room.room_status)}`}>{room.room_status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{room.total_tenants}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-green-600 font-medium">{room.active_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-blue-600 font-medium">{room.paid_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-red-600 font-medium">{room.due_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-yellow-600 font-medium">{room.adjust_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-orange-600 font-medium">{room.departing_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-gray-600 font-medium">{room.left_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"><span className="text-purple-600 font-medium">{room.pending_tenants}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(room.total_rent)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(room.total_deposit)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button onClick={() => openEditRoom(room)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Room Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vacantRooms.map((room) => (
                <tr key={room.room_number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {room.room_number}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      VACANT
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Add Tenant
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800">Total Occupied Rooms</h3>
          <p className="text-2xl font-bold text-blue-900">{roomStatuses.filter(r => r.room_status !== 'VACANT').length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-800">Total Vacant Rooms</h3>
          <p className="text-2xl font-bold text-gray-900">{vacantRooms.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-800">Total Active Tenants</h3>
          <p className="text-2xl font-bold text-green-900">{roomStatuses.reduce((sum, room) => sum + room.active_tenants, 0)}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800">Total Monthly Rent</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {formatCurrency(roomStatuses.reduce((sum, room) => sum + room.total_rent, 0))}
          </p>
        </div>
      </div>

      {editRoom && (
        <EditRoomForm
          room={editRoom}
          onUpdateRoom={handleUpdateRoom}
          onClose={() => setEditRoom(null)}
          isOpen={!!editRoom}
        />
      )}
    </div>
  );
};

export default RoomStatusView; 