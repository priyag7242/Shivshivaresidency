import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { Edit, Eye, Trash2 } from 'lucide-react';

const NewRoomsDashboard: React.FC = () => {
  const { rooms, tenants, loading } = useData();

  // Force render a very obvious element
  return (
    <div style={{ padding: '20px' }}>
      {/* SUPER OBVIOUS TEST */}
      <div style={{
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: '30px',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '20px 0',
        border: '10px solid #000000',
        borderRadius: '10px'
      }}>
        🎉 SUCCESS! NEW ROOMS DASHBOARD IS WORKING! 🎉
        <br />
        <span style={{ fontSize: '18px' }}>
          Total Rooms: {rooms.length} | Total Tenants: {tenants.length}
        </span>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#3b82f6', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Total Rooms</h3>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>{rooms.length}</p>
        </div>
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Total Tenants</h3>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>{tenants.length}</p>
        </div>
        <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Occupied Rooms</h3>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>
            {rooms.filter(r => r.status === 'occupied').length}
          </p>
        </div>
        <div style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Vacant Rooms</h3>
          <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold' }}>
            {rooms.filter(r => r.status === 'vacant').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>Rooms & Tenants</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Room Number</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Mobile</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Rent</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Sharing Type</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.slice(0, 10).map((room, index) => {
              const tenant = tenants.find(t => t.roomNumber === room.roomNumber && ['active', 'paid', 'due'].includes(t.status));
              return (
                <tr key={room.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{room.roomNumber}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{tenant?.name || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{tenant?.mobile || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>₹{tenant?.monthlyRent?.toLocaleString() || '0'}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{room.roomType}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: tenant ? '#dcfce7' : '#f3f4f6',
                      color: tenant ? '#166534' : '#374151'
                    }}>
                      {tenant ? 'occupied' : 'vacant'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Edit style={{ width: '16px', height: '16px', color: '#3b82f6', cursor: 'pointer' }} />
                      <Eye style={{ width: '16px', height: '16px', color: '#10b981', cursor: 'pointer' }} />
                      <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444', cursor: 'pointer' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
          Showing first 10 rooms of {rooms.length} total
        </div>
      </div>
    </div>
  );
};

export default NewRoomsDashboard;