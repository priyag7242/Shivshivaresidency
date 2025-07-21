import React, { useState, useEffect } from 'react';
import { Building, Users, DollarSign, AlertTriangle, CheckCircle, XCircle, Settings, Plus, Filter, Search, Home, Bed, MapPin } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Room, Tenant } from '../../types';
import AddRoomForm from './AddRoomForm';
import EditRoomForm from './EditRoomForm';

interface RoomStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  totalRevenue: number;
  potentialRevenue: number;
  averageRent: number;
}

interface FloorStats {
  floor: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  totalRevenue: number;
}

const RoomsDashboard: React.FC = () => {
  const { rooms, tenants, loading, addRoom, updateRoom } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant' | 'maintenance'>('all');
  const [filterFloor, setFilterFloor] = useState<'all' | number>('all');
  const [filterRoomType, setFilterRoomType] = useState<'all' | 'single' | 'double' | 'triple' | 'quad'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate room statistics
  const calculateRoomStats = (): RoomStats => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
    const vacantRooms = rooms.filter(room => room.status === 'vacant').length;
    const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    const totalRevenue = rooms
      .filter(room => room.status === 'occupied')
      .reduce((sum, room) => sum + room.rentAmount, 0);
    
    const potentialRevenue = rooms.reduce((sum, room) => sum + room.rentAmount, 0);
    const averageRent = totalRooms > 0 ? Math.round(potentialRevenue / totalRooms) : 0;

    return {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      maintenanceRooms,
      occupancyRate,
      totalRevenue,
      potentialRevenue,
      averageRent
    };
  };

  // Calculate floor statistics
  const calculateFloorStats = (): FloorStats[] => {
    const floorMap = new Map<number, FloorStats>();
    
    rooms.forEach(room => {
      if (!floorMap.has(room.floor)) {
        floorMap.set(room.floor, {
          floor: room.floor,
          totalRooms: 0,
          occupiedRooms: 0,
          vacantRooms: 0,
          maintenanceRooms: 0,
          totalRevenue: 0
        });
      }
      
      const floorStats = floorMap.get(room.floor)!;
      floorStats.totalRooms++;
      
      if (room.status === 'occupied') {
        floorStats.occupiedRooms++;
        floorStats.totalRevenue += room.rentAmount;
      } else if (room.status === 'vacant') {
        floorStats.vacantRooms++;
      } else if (room.status === 'maintenance') {
        floorStats.maintenanceRooms++;
      }
    });
    
    return Array.from(floorMap.values()).sort((a, b) => a.floor - b.floor);
  };

  // Filter rooms based on current filters
  const filteredRooms = rooms.filter(room => {
    if (filterStatus !== 'all' && room.status !== filterStatus) return false;
    if (filterFloor !== 'all' && room.floor !== filterFloor) return false;
    if (filterRoomType !== 'all' && room.roomType !== filterRoomType) return false;
    if (searchTerm && !room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get tenant for a room
  const getTenantForRoom = (roomNumber: string): Tenant | undefined => {
    return tenants.find(tenant => tenant.roomNumber === roomNumber && tenant.status === 'active');
  };

  // Get unique floors for filter
  const uniqueFloors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);

  const roomStats = calculateRoomStats();
  const floorStats = calculateFloorStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vacant':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <CheckCircle className="w-4 h-4" />;
      case 'vacant':
        return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getRoomTypeIcon = (roomType: string) => {
    switch (roomType) {
      case 'single':
        return <Bed className="w-4 h-4" />;
      case 'double':
        return <Users className="w-4 h-4" />;
      case 'triple':
      case 'quad':
        return <Building className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rooms Dashboard</h1>
          <p className="text-gray-600">Manage and monitor all rooms in your property</p>
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
              <p className="text-3xl font-bold text-gray-900">{roomStats.totalRooms}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-green-600">{roomStats.occupancyRate}%</p>
              <p className="text-sm text-gray-500">{roomStats.occupiedRooms} of {roomStats.totalRooms} occupied</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{roomStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">of ₹{roomStats.potentialRevenue.toLocaleString()} potential</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vacant Rooms</p>
              <p className="text-3xl font-bold text-yellow-600">{roomStats.vacantRooms}</p>
              <p className="text-sm text-gray-500">{roomStats.maintenanceRooms} under maintenance</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Floor Statistics */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Floor Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {floorStats.map(floor => (
              <div key={floor.floor} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Floor {floor.floor}
                  </h3>
                  <span className="text-sm text-gray-500">{floor.totalRooms} rooms</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Occupied: {floor.occupiedRooms}</span>
                    <span className="text-yellow-600">Vacant: {floor.vacantRooms}</span>
                  </div>
                  {floor.maintenanceRooms > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Maintenance: {floor.maintenanceRooms}</span>
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-900">
                    Revenue: ₹{floor.totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rooms..."
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
                  <option value="all">All Status</option>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Maintenance</option>
                </select>

                <select
                  value={filterFloor}
                  onChange={(e) => setFilterFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Floors</option>
                  {uniqueFloors.map(floor => (
                    <option key={floor} value={floor}>Floor {floor}</option>
                  ))}
                </select>

                <select
                  value={filterRoomType}
                  onChange={(e) => setFilterRoomType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Display */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Rooms ({filteredRooms.length})
          </h2>
        </div>
        
        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your filters or add new rooms.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map(room => {
              const tenant = getTenantForRoom(room.roomNumber);
              return (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{room.roomNumber}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        {getRoomTypeIcon(room.roomType)}
                        {room.roomType} • Floor {room.floor}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingRoom(room)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mb-3 ${getStatusColor(room.status)}`}>
                    {getStatusIcon(room.status)}
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{room.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium">₹{room.rentAmount.toLocaleString()}</span>
                    </div>
                    {tenant && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-600">{tenant.mobile}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map(room => {
                  const tenant = getTenantForRoom(room.roomNumber);
                  return (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
                          <div className="text-sm text-gray-500">Floor {room.floor}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRoomTypeIcon(room.roomType)}
                          <span className="text-sm text-gray-900 capitalize">{room.roomType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                          {getStatusIcon(room.status)}
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tenant ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.mobile}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{room.rentAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingRoom(room)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AddRoomForm
              onAddRoom={async (roomData) => {
                await addRoom(roomData);
                setShowAddForm(false);
                return {} as Room; // The form doesn't use the return value
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
                return {} as Room; // The form doesn't use the return value
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

export default RoomsDashboard;