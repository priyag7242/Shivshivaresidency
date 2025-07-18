import React, { useState, useEffect, useCallback } from 'react';
import { Room } from '../../types';

interface AddRoomFormProps {
  onAddRoom: (room: Omit<Room, 'id'>) => Promise<Room>;
  onClose: () => void;
  isOpen: boolean;
}

const AddRoomForm: React.FC<AddRoomFormProps> = React.memo(({ onAddRoom, onClose, isOpen }) => {
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    floor: 1,
    roomType: 'single' as const,
    capacity: 1,
    rentAmount: 0,
    status: 'vacant' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setNewRoom({
        roomNumber: '',
        floor: 1,
        roomType: 'single' as const,
        capacity: 1,
        rentAmount: 0,
        status: 'vacant' as const
      });
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = useCallback((field: keyof typeof newRoom, value: string | number) => {
    setNewRoom(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate the room data
      if (!newRoom.roomNumber.trim()) {
        throw new Error('Room number is required');
      }
      if (newRoom.floor < 1) {
        throw new Error('Floor must be at least 1');
      }
      if (newRoom.capacity < 1 || newRoom.capacity > 4) {
        throw new Error('Capacity must be between 1 and 4');
      }
      if (newRoom.rentAmount < 0) {
        throw new Error('Rent amount cannot be negative');
      }

      await onAddRoom(newRoom);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add room');
    } finally {
      setIsSubmitting(false);
    }
  }, [newRoom, onAddRoom, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Room</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number *
            </label>
            <input
              key={isOpen ? 'open' : 'closed'}
              autoFocus
              type="text"
              required
              value={newRoom.roomNumber}
              onChange={(e) => handleInputChange('roomNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor *
            </label>
            <input
              type="number"
              required
              min="1"
              value={newRoom.floor}
              onChange={(e) => handleInputChange('floor', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              required
              value={newRoom.roomType}
              onChange={(e) => handleInputChange('roomType', e.target.value as 'single' | 'double' | 'triple' | 'quad')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="quad">Quad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              required
              min="1"
              max="4"
              value={newRoom.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={newRoom.rentAmount}
              onChange={(e) => handleInputChange('rentAmount', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              required
              value={newRoom.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'occupied' | 'vacant' | 'maintenance')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

AddRoomForm.displayName = 'AddRoomForm';

export default AddRoomForm; 