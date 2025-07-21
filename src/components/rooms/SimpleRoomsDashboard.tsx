import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface RoomRow {
  roomNumber: string;
  name: string;
  mobile: string;
  rent: number;
  sharingType: string;
  deposit: number;
  status: string;
  noticeGiven: string;
  noticeDate: string;
}

const SimpleRoomsDashboard: React.FC = () => {
  console.log('SimpleRoomsDashboard component is being rendered!');
  const { rooms, tenants, loading } = useData();
  const [roomRows, setRoomRows] = useState<RoomRow[]>([]);

  useEffect(() => {
    if (!loading) {
      // Create rows that match your screenshot exactly
      const rows: RoomRow[] = [];
      
      // Get all unique room numbers
      const allRoomNumbers = new Set([
        ...rooms.map(r => r.roomNumber),
        ...tenants.map(t => t.roomNumber)
      ]);

      // Sort room numbers
      const sortedRooms = Array.from(allRoomNumbers).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true });
      });

      sortedRooms.forEach(roomNumber => {
        const room = rooms.find(r => r.roomNumber === roomNumber);
        const tenant = tenants.find(t => 
          t.roomNumber === roomNumber && 
          ['active', 'paid', 'due', 'adjust', 'departing', 'hold'].includes(t.status)
        );

        const row: RoomRow = {
          roomNumber,
          name: tenant?.name || '-',
          mobile: tenant?.mobile || '-',
          rent: tenant?.monthlyRent || 0,
          sharingType: room?.roomType || 'single',
          deposit: tenant?.securityDeposit || 0,
          status: tenant ? 'occupied' : 'vacant',
          noticeGiven: tenant?.noticeGiven ? 'Yes' : 'No',
          noticeDate: tenant?.noticeDate || '-'
        };

        rows.push(row);
      });

      setRoomRows(rows);
    }
  }, [rooms, tenants, loading]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
          <h1 className="text-2xl font-bold text-green-800">🏠 NEW Rooms Dashboard is Working!</h1>
          <p className="text-green-700">This is the updated rooms component with your exact table format.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sharing Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deposit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notice Given
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notice Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roomRows.map((row, index) => (
              <tr key={`${row.roomNumber}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.roomNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.mobile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.rent > 0 ? `₹${row.rent.toLocaleString()}` : '₹0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {row.sharingType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.deposit > 0 ? row.deposit.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.status === 'occupied' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.noticeGiven}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.noticeDate !== '-' ? new Date(row.noticeDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {roomRows.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No rooms data available</p>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800">🔍 Debug Info:</h3>
        <p className="text-blue-700">Total Rooms: {rooms.length}</p>
        <p className="text-blue-700">Total Tenants: {tenants.length}</p>
        <p className="text-blue-700">Rows Generated: {roomRows.length}</p>
      </div>
    </div>
  );
};

export default SimpleRoomsDashboard;