import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Plus, 
  Search, 
  Home, 
  Phone, 
  Calendar,
  Edit,
  Eye,
  Trash2,
  Filter,
  MapPin,
  Bed
} from 'lucide-react';
import AddRoomForm from './AddRoomForm';
import EditRoomForm from './EditRoomForm';
import { Room, Tenant } from '../../types';

interface RoomWithTenant {
  roomNumber: string;
  tenant?: {
    id: string;
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
  room?: Room;
  roomStatus: 'occupied' | 'vacant' | 'maintenance';
  floor?: number;
  roomType?: string;
  capacity?: number;
  rentAmount?: number;
}

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  maintenanceRooms: number;
  totalTenants: number;
  totalRent: number;
  totalDeposit: number;
  noticePeriodTenants: number;
  averageRent: number;
  occupancyRate: number;
}

interface FloorStats {
  floor: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRevenue: number;
}

const RoomManagement: React.FC = () => {
  console.log('🏠 RoomManagement Dashboard - Starting to render...');
  
  const { rooms, tenants, loading, addRoom, updateRoom } = useData();
  const [roomsWithTenants, setRoomsWithTenants] = useState<RoomWithTenant[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant' | 'maintenance'>('all');
  const [filterNotice, setFilterNotice] = useState<'all' | 'notice_given' | 'no_notice'>('all');
  const [filterFloor, setFilterFloor] = useState<'all' | number>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'room' | 'name' | 'rent' | 'status'>('room');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  console.log('Data received - Rooms:', rooms.length, 'Tenants:', tenants.length);

  // Process rooms and tenants data
  useEffect(() => {
    if (!loading && rooms.length > 0) {
      console.log('Processing rooms and tenants data...');
      
      const processedRooms: RoomWithTenant[] = [];
      
      // Get all unique room numbers from both rooms and tenants
      const allRoomNumbers = new Set([
        ...rooms.map(r => r.roomNumber),
        ...tenants.map(t => t.roomNumber)
      ]);

      console.log('Found room numbers:', Array.from(allRoomNumbers).slice(0, 10));

      // Sort room numbers numerically
      const sortedRoomNumbers = Array.from(allRoomNumbers).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true });
      });

      sortedRoomNumbers.forEach(roomNumber => {
        const room = rooms.find(r => r.roomNumber === roomNumber);
        const activeTenant = tenants.find(t => 
          t.roomNumber === roomNumber && 
          ['active', 'paid', 'due', 'adjust', 'departing', 'hold'].includes(t.status)
        );

        if (!activeTenant && !['001', '305', '319'].includes(roomNumber)) {
          console.log('No active tenant found for room:', roomNumber);
        }

        const roomWithTenant: RoomWithTenant = {
          roomNumber,
          roomStatus: activeTenant ? 'occupied' : 'vacant',
          floor: room?.floor,
          roomType: room?.roomType || 'single',
          capacity: room?.capacity,
          rentAmount: room?.rentAmount,
          room
        };

        if (activeTenant) {
          roomWithTenant.tenant = {
            id: activeTenant.id,
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

        processedRooms.push(roomWithTenant);
      });

      console.log('Processed rooms:', processedRooms.length);
      setRoomsWithTenants(processedRooms);
    }
  }, [rooms, tenants, loading]);

  // Calculate statistics
  const calculateStats = (): DashboardStats => {
    const totalRooms = roomsWithTenants.length;
    const occupiedRooms = roomsWithTenants.filter(r => r.roomStatus === 'occupied').length;
    const vacantRooms = roomsWithTenants.filter(r => r.roomStatus === 'vacant').length;
    const maintenanceRooms = roomsWithTenants.filter(r => r.roomStatus === 'maintenance').length;
    const totalTenants = occupiedRooms;
    const totalRent = roomsWithTenants.reduce((sum, r) => sum + (r.tenant?.rent || 0), 0);
    const totalDeposit = roomsWithTenants.reduce((sum, r) => sum + (r.tenant?.deposit || 0), 0);
    const noticePeriodTenants = roomsWithTenants.filter(r => r.tenant?.noticeGiven).length;
    const averageRent = totalTenants > 0 ? Math.round(totalRent / totalTenants) : 0;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      maintenanceRooms,
      totalTenants,
      totalRent,
      totalDeposit,
      noticePeriodTenants,
      averageRent,
      occupancyRate
    };
  };

  // Calculate floor statistics
  const calculateFloorStats = (): FloorStats[] => {
    const floorMap = new Map<number, FloorStats>();
    
    roomsWithTenants.forEach(room => {
      if (room.floor) {
        if (!floorMap.has(room.floor)) {
          floorMap.set(room.floor, {
            floor: room.floor,
            totalRooms: 0,
            occupiedRooms: 0,
            vacantRooms: 0,
            totalRevenue: 0
          });
        }
        
        const floorStats = floorMap.get(room.floor)!;
        floorStats.totalRooms++;
        
        if (room.roomStatus === 'occupied') {
          floorStats.occupiedRooms++;
          floorStats.totalRevenue += room.tenant?.rent || 0;
        } else if (room.roomStatus === 'vacant') {
          floorStats.vacantRooms++;
        }
      }
    });
    
    return Array.from(floorMap.values()).sort((a, b) => a.floor - b.floor);
  };

  // Filter and sort rooms
  const getFilteredAndSortedRooms = (): RoomWithTenant[] => {
    let filtered = [...roomsWithTenants];

    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => room.roomStatus === filterStatus);
    }

    if (filterFloor !== 'all') {
      filtered = filtered.filter(room => room.floor === filterFloor);
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
  const floorStats = calculateFloorStats();
  const filteredRooms = getFilteredAndSortedRooms();
  const uniqueFloors = [...new Set(roomsWithTenants.map(r => r.floor).filter(Boolean))].sort((a, b) => a! - b!);

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
        return <AlertTriangle className="w-4 h-4" />;
      case 'departing':
        return <XCircle className="w-4 h-4" />;
      case 'vacant':
        return <Home className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return '-';
    }
  };

  // Show loading state
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
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  console.log('Rendering dashboard with stats:', stats);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-6 mb-8 rounded-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-xl font-bold text-green-800">
              🎉 Comprehensive Rooms Dashboard
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Successfully loaded <strong>{stats.totalRooms} rooms</strong> and <strong>{stats.totalTenants} active tenants</strong> with complete functionality including statistics, filtering, and management tools.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Rooms Management</h1>
          <p className="text-lg text-gray-600">Complete overview and management of all rooms, tenants, and property statistics</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Room
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
              <p className="text-sm text-green-600 font-medium">{stats.occupancyRate}% occupied</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{stats.totalRent.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Avg: ₹{stats.averageRent.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Deposits</p>
              <p className="text-3xl font-bold text-blue-600">₹{stats.totalDeposit.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total collected</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notice Period</p>
              <p className="text-3xl font-bold text-orange-600">{stats.noticePeriodTenants}</p>
              <p className="text-sm text-gray-500">Tenants leaving</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Floor Statistics */}
      {floorStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Floor Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floorStats.map(floor => (
                <div key={floor.floor} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Floor {floor.floor}
                    </h3>
                    <span className="text-sm text-gray-500">{floor.totalRooms} rooms</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Occupied: {floor.occupiedRooms}</span>
                      <span className="text-gray-600">Vacant: {floor.vacantRooms}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Revenue: ₹{floor.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search rooms, names, mobile numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 text-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Maintenance</option>
                </select>

                {uniqueFloors.length > 0 && (
                  <select
                    value={filterFloor}
                    onChange={(e) => setFilterFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Floors</option>
                    {uniqueFloors.map(floor => (
                      <option key={floor} value={floor}>Floor {floor}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filterNotice}
                  onChange={(e) => setFilterNotice(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Notice Status</option>
                  <option value="notice_given">Notice Given</option>
                  <option value="no_notice">No Notice</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Display */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Rooms Overview ({filteredRooms.length} of {stats.totalRooms} rooms)
          </h2>
        </div>
        
        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('room')}
                  >
                    <div className="flex items-center gap-2">
                      Room Number 
                      {sortBy === 'room' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name 
                      {sortBy === 'name' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('rent')}
                  >
                    <div className="flex items-center gap-2">
                      Rent 
                      {sortBy === 'rent' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharing Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status 
                      {sortBy === 'status' && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Given</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room, index) => (
                  <tr key={`${room.roomNumber}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-gray-900">{room.roomNumber}</div>
                        {room.floor && <div className="text-xs text-gray-500">Floor {room.floor}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {room.tenant?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        {room.tenant?.mobile ? (
                          <>
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="font-mono">{room.tenant.mobile}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {room.tenant?.rent ? `₹${room.tenant.rent.toLocaleString()}` : '₹0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        {getRoomTypeIcon(room.roomType || 'single')}
                        <span className="capitalize">{room.roomType || 'single'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {room.tenant?.deposit ? `${room.tenant.deposit.toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.tenant?.status || 'vacant')}`}>
                        {getStatusIcon(room.tenant?.status || 'vacant')}
                        <span className="capitalize">{room.tenant?.status || 'vacant'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${room.tenant?.noticeGiven ? 'text-orange-600' : 'text-gray-500'}`}>
                        {room.tenant?.noticeGiven ? 'Yes' : 'No'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        {room.tenant?.noticeDate ? (
                          <>
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{formatDate(room.tenant.noticeDate)}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (room.room) setEditingRoom(room.room);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit Room"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room, index) => (
              <div key={`${room.roomNumber}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{room.roomNumber}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {getRoomTypeIcon(room.roomType || 'single')}
                      <span className="capitalize">{room.roomType || 'single'}</span>
                      {room.floor && <span>• Floor {room.floor}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (room.room) setEditingRoom(room.room);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mb-3 ${getStatusColor(room.tenant?.status || 'vacant')}`}>
                  {getStatusIcon(room.tenant?.status || 'vacant')}
                  <span className="capitalize">{room.tenant?.status || 'vacant'}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rent:</span>
                    <span className="font-bold">{room.tenant?.rent ? `₹${room.tenant.rent.toLocaleString()}` : '₹0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-medium">{room.tenant?.deposit ? `${room.tenant.deposit.toLocaleString()}` : '-'}</span>
                  </div>
                  {room.tenant && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{room.tenant.name}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {room.tenant.mobile}
                      </p>
                      {room.tenant.noticeGiven && (
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          Notice: {formatDate(room.tenant.noticeDate)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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

export default RoomManagement;



