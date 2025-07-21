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

const RoomManagement: React.FC = () => {
  console.log('🏠 RoomManagement component is being rendered!');
  
  // Alert to show the component is loading
  React.useEffect(() => {
    console.log('🔥 COMPONENT MOUNTED - Dashboard should be visible!');
  }, []);
  
  const { rooms, tenants, loading } = useData();
  const [roomRows, setRoomRows] = useState<RoomRow[]>([]);

  console.log('Data loaded. Rooms:', rooms);
  console.log('Tenants:', tenants);

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

        if (!tenant && roomNumber !== '001' && roomNumber !== '305' && roomNumber !== '319') {
          console.log('No active tenant found for room:', roomNumber);
        }

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

      console.log('Generated room rows:', rows.length);
      console.log('🎯 About to render dashboard with', rows.length, 'rooms');
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
      {/* SUPER OBVIOUS TEST ELEMENT */}
      <div style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '20px 0',
        border: '5px solid black'
      }}>
        🚨 THIS IS THE NEW DASHBOARD! 🚨
        <br />
        If you see this, the component is working!
      </div>
      
      {/* SUCCESS BANNER */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">
              🎉 SUCCESS! New Rooms Dashboard is Working!
            </h3>
            <p className="mt-1 text-sm text-green-700">
              This is your updated rooms dashboard with enhanced features and the exact table format you requested.
            </p>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Rooms</dt>
                  <dd className="text-3xl font-bold text-gray-900">{rooms.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tenants</dt>
                  <dd className="text-3xl font-bold text-green-600">{tenants.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Rent</dt>
                  <dd className="text-3xl font-bold text-yellow-600">
                    ₹{tenants.reduce((sum, t) => sum + (t.monthlyRent || 0), 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Occupied Rooms</dt>
                  <dd className="text-3xl font-bold text-purple-600">
                    {roomRows.filter(r => r.status === 'occupied').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Rooms Management</h3>
          <p className="text-sm text-gray-500">Complete overview of all rooms and tenant information</p>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharing Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Given</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <button className="text-blue-600 hover:text-blue-900" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Delete">
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
    </div>
  );
};

export default RoomManagement;



