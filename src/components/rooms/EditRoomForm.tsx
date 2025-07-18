import React, { useState, useEffect, useCallback } from 'react';
import { Room } from '../../types';

interface EditRoomFormProps {
  room: Room | null;
  onUpdateRoom: (id: string, updates: Partial<Room>) => Promise<Room>;
  onClose: () => void;
  isOpen: boolean;
}

const EditRoomForm: React.FC<EditRoomFormProps> = React.memo(({ room, onUpdateRoom, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    roomType: 'single' as 'single' | 'double' | 'triple' | 'quad',
    capacity: 1,
    rentAmount: 0,
    status: 'vacant' as 'occupied' | 'vacant' | 'maintenance'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Update form data when room changes
  useEffect(() => {
    if (room && isOpen) {
      setFormData({
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
        capacity: room.capacity,
        rentAmount: room.rentAmount,
        status: room.status
      });
      setError('');
      setIsSubmitting(false);
    }
  }, [room, isOpen]);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Validate the room data
      if (!formData.roomNumber.trim()) {
        throw new Error('Room number is required');
      }
      if (formData.floor < 1) {
        throw new Error('Floor must be at least 1');
      }
      if (formData.capacity < 1 || formData.capacity > 4) {
        throw new Error('Capacity must be between 1 and 4');
      }
      if (formData.rentAmount < 0) {
        throw new Error('Rent amount cannot be negative');
      }

      await onUpdateRoom(room.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, room, onUpdateRoom, onClose]);

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Room {room.roomNumber}</h3>
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
              value={formData.roomNumber}
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
              value={formData.floor}
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
              value={formData.roomType}
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
              value={formData.capacity}
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
              value={formData.rentAmount}
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
              value={formData.status}
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
              {isSubmitting ? 'Updating...' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

EditRoomForm.displayName = 'EditRoomForm';

export default EditRoomForm; 