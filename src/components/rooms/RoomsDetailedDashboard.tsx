import React, { useState, useEffect } from 'react';
import { Building, Users, DollarSign, AlertTriangle, CheckCircle, XCircle, Settings, Plus, Filter, Search, Home, Bed, MapPin, Phone, Calendar, AlertCircle, User } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Room, Tenant } from '../../types';
import AddRoomForm from './AddRoomForm';
import EditRoomForm from './EditRoomForm';

interface RoomWithTenant {
  roomNumber: string;
  tenant?: {
    name: string;
    mobile: string;
    rent: number;
    deposit: number;
    status: string;
    sharingType: string;
    noticeGiven: boolean;
    noticeDate?: string;
    joiningDate: string;
  };
  roomStatus: 'occupied' | 'vacant' | 'maintenance';
  floor?: number;
  roomType?: string;
  capacity?: number;
}

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalTenants: number;
  totalRent: number;
  totalDeposit: number;
  noticePeriodTenants: number;
  averageRent: number;
}

const RoomsDetailedDashboard: React.FC = () => {
  const { rooms, tenants, loading, addRoom, updateRoom } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant' | 'maintenance'>('all');
  const [filterNotice, setFilterNotice] = useState<'all' | 'notice_given' | 'no_notice'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'room' | 'name' | 'rent' | 'status'>('room');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Combine rooms and tenants data
  const getRoomsWithTenants = (): RoomWithTenant[] => {
    const roomsWithTenants: RoomWithTenant[] = [];
    
    // Get all unique room numbers from both rooms and tenants
    const allRoomNumbers = new Set([
      ...rooms.map(r => r.roomNumber),
      ...tenants.map(t => t.roomNumber)
    ]);

    allRoomNumbers.forEach(roomNumber => {
      const room = rooms.find(r => r.roomNumber === roomNumber);
      const activeTenant = tenants.find(t => 
        t.roomNumber === roomNumber && 
        ['active', 'paid', 'due', 'adjust', 'departing', 'hold'].includes(t.status)
      );

      const roomWithTenant: RoomWithTenant = {
        roomNumber,
        roomStatus: activeTenant ? 'occupied' : 'vacant',
        floor: room?.floor,
        roomType: room?.roomType,
        capacity: room?.capacity
      };

      if (activeTenant) {
        roomWithTenant.tenant = {
          name: activeTenant.name,
          mobile: activeTenant.mobile,
          rent: activeTenant.monthlyRent,
          deposit: activeTenant.securityDeposit,
          status: activeTenant.status,
          sharingType: room?.roomType || 'single',
          noticeGiven: activeTenant.noticeGiven || false,
          noticeDate: activeTenant.noticeDate,
          joiningDate: activeTenant.joiningDate
        };
      }

      roomsWithTenants.push(roomWithTenant);
    });

    return roomsWithTenants.sort((a, b) => {
      // Sort by room number by default
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    });
  };

  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    const roomsWithTenants = getRoomsWithTenants();
    const occupiedRooms = roomsWithTenants.filter(r => r.roomStatus === 'occupied');
    
    return {
      totalRooms: roomsWithTenants.length,
      occupiedRooms: occupiedRooms.length,
      vacantRooms: roomsWithTenants.filter(r => r.roomStatus === 'vacant').length,
      totalTenants: occupiedRooms.length,
      totalRent: occupiedRooms.reduce((sum, r) => sum + (r.tenant?.rent || 0), 0),
      totalDeposit: occupiedRooms.reduce((sum, r) => sum + (r.tenant?.deposit || 0), 0),
      noticePeriodTenants: occupiedRooms.filter(r => r.tenant?.noticeGiven).length,
      averageRent: occupiedRooms.length > 0 ? Math.round(occupiedRooms.reduce((sum, r) => sum + (r.tenant?.rent || 0), 0) / occupiedRooms.length) : 0
    };
  };

  // Filter and sort rooms
  const getFilteredAndSortedRooms = (): RoomWithTenant[] => {
    let filtered = getRoomsWithTenants();

    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => room.roomStatus === filterStatus);
    }

    if (filterNotice !== 'all') {
      if (filterNotice === 'notice_given') {
        filtered = filtered.filter(room => room.tenant?.noticeGiven === true);
      } else {
        filtered = filtered.filter(room => room.tenant?.noticeGiven !== true);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.tenant?.mobile.includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'room':
          aValue = a.roomNumber;
          bValue = b.roomNumber;
          break;
        case 'name':
          aValue = a.tenant?.name || '';
          bValue = b.tenant?.name || '';
          break;
        case 'rent':
          aValue = a.tenant?.rent || 0;
          bValue = b.tenant?.rent || 0;
          break;
        case 'status':
          aValue = a.tenant?.status || 'vacant';
          bValue = b.tenant?.status || 'vacant';
          break;
        default:
          aValue = a.roomNumber;
          bValue = b.roomNumber;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue, undefined, { numeric: true })
          : bValue.localeCompare(aValue, undefined, { numeric: true });
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  };

  const stats = calculateStats();
  const filteredRooms = getFilteredAndSortedRooms();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'adjust':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'departing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'hold':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vacant':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'due':
        return <AlertCircle className="w-4 h-4" />;
      case 'departing':
        return <AlertTriangle className="w-4 h-4" />;
      case 'vacant':
        return <Home className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const handleSort = (column: 'room' | 'name' | 'rent' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* DEBUG: This should be visible if the component is loading */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        ✅ RoomsDetailedDashboard is loading correctly!
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">🏠 Rooms Detailed Dashboard</h1>
          <p className="text-gray-600">Complete view of all rooms with tenant information and statistics</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
              <p className="text-sm text-gray-500">{stats.occupiedRooms} occupied</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
              <p className="text-3xl font-bold text-green-600">₹{stats.totalRent.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Avg: ₹{stats.averageRent.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Deposit</p>
              <p className="text-3xl font-bold text-blue-600">₹{stats.totalDeposit.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total collected</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notice Period</p>
              <p className="text-3xl font-bold text-orange-600">{stats.noticePeriodTenants}</p>
              <p className="text-sm text-gray-500">Tenants leaving</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rooms, names, mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Rooms</option>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                </select>

                <select
                  value={filterNotice}
                  onChange={(e) => setFilterNotice(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Notice Status</option>
                  <option value="notice_given">Notice Given</option>
                  <option value="no_notice">No Notice</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Rooms ({filteredRooms.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('room')}
                >
                  Room Number {sortBy === 'room' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rent')}
                >
                  Rent {sortBy === 'rent' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharing Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Given</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.map((room, index) => (
                <tr key={`${room.roomNumber}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
                    {room.floor && <div className="text-sm text-gray-500">Floor {room.floor}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {room.tenant?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      {room.tenant?.mobile ? (
                        <>
                          <Phone className="w-3 h-3" />
                          {room.tenant.mobile}
                        </>
                      ) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {room.tenant?.rent ? `₹${room.tenant.rent.toLocaleString()}` : '₹0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {room.tenant?.sharingType || room.roomType || 'single'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {room.tenant?.deposit ? `${room.tenant.deposit.toLocaleString()}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.tenant?.status || 'vacant')}`}>
                      {getStatusIcon(room.tenant?.status || 'vacant')}
                      {room.tenant?.status || 'vacant'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {room.tenant?.noticeGiven ? 'Yes' : 'No'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      {room.tenant?.noticeDate ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          {formatDate(room.tenant.noticeDate)}
                        </>
                      ) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        const roomData = rooms.find(r => r.roomNumber === room.roomNumber);
                        if (roomData) setEditingRoom(roomData);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRooms.length === 0 && (
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AddRoomForm
              onAddRoom={async (roomData) => {
                await addRoom(roomData);
                setShowAddForm(false);
                return {} as Room;
              }}
              onClose={() => setShowAddForm(false)}
              isOpen={showAddForm}
            />
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <EditRoomForm
              room={editingRoom}
              onUpdateRoom={async (id: string, roomData: Partial<Room>) => {
                await updateRoom(id, roomData);
                setEditingRoom(null);
                return {} as Room;
              }}
              onClose={() => setEditingRoom(null)}
              isOpen={!!editingRoom}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsDetailedDashboard;