import React, { useMemo } from 'react';
import { Building, Users, Bed, CheckCircle } from 'lucide-react';
import { useData } from '../../hooks/useData';

// Re-usable stat card component
interface StatCardProps {
  label: string;
  value: string | number;
  colorClasses: string; // Tailwind colour utility classes like "bg-blue-100 text-blue-700"
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, colorClasses, Icon }) => (
  <div className={`card p-6 flex items-center space-x-4 ${colorClasses}`}>
    <Icon className="h-8 w-8" />
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold leading-none">{value}</p>
    </div>
  </div>
);

/**
 * RoomsDashboard / RoomManagement component ‑ shows high-level stats for rooms
 */
const RoomManagement: React.FC = () => {
  const { rooms, loading, error } = useData();

  // Memoise expensive aggregations
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const vacantRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Group by floor number (ascending order)
    const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
    const floorStats = floors.map((floor) => {
      const floorRooms = rooms.filter((r) => r.floor === floor);
      const total = floorRooms.length;
      const occupied = floorRooms.filter((r) => r.status === 'occupied').length;
      const vacant = total - occupied;
      const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0;
      const totalRent = floorRooms.reduce((sum, r) => sum + (r.rentAmount ?? 0), 0);
      return { floor, total, occupied, vacant, occupancy, totalRent };
    });

    // Group by room type
    const types: Array<'single' | 'double' | 'triple' | 'quad'> = ['single', 'double', 'triple', 'quad'];
    const typeStats = types.map((type) => {
      const typeRooms = rooms.filter((r) => r.roomType === type);
      const total = typeRooms.length;
      const occupied = typeRooms.filter((r) => r.status === 'occupied').length;
      const vacant = total - occupied;
      return { type, total, occupied, vacant };
    });

    return {
      totalRooms,
      occupiedRooms,
      vacantRooms,
      occupancyRate,
      floorStats,
      typeStats,
    };
  }, [rooms]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Rooms Dashboard</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Rooms" value={stats.totalRooms} colorClasses="bg-blue-100 text-blue-700" Icon={Building} />
        <StatCard label="Occupied" value={stats.occupiedRooms} colorClasses="bg-green-100 text-green-700" Icon={Users} />
        <StatCard label="Vacant" value={stats.vacantRooms} colorClasses="bg-red-100 text-red-700" Icon={Bed} />
        <StatCard label="Occupancy Rate" value={`${stats.occupancyRate}%`} colorClasses="bg-purple-100 text-purple-700" Icon={CheckCircle} />
      </div>

      {/* Floor-wise breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Breakdown by Floor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.floorStats.map((f) => (
            <div key={f.floor} className="card p-4">
              <h4 className="text-lg font-medium mb-2">Floor {f.floor}</h4>
              <div className="flex justify-between text-sm mb-1">
                <span>Total Rooms:</span>
                <span className="font-medium">{f.total}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Occupied:</span>
                <span className="text-green-600 font-medium">{f.occupied}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vacant:</span>
                <span className="text-red-600 font-medium">{f.vacant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Occupancy Rate:</span>
                <span className="font-medium">{f.occupancy}%</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Total Rent:</span>
                <span className="font-medium">₹{f.totalRent.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room-type breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Breakdown by Room Type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.typeStats.map((t) => (
            <div key={t.type} className="card p-4 text-center">
              <p className="text-lg font-medium capitalize mb-1">{t.type}</p>
              <p className="text-2xl font-bold mb-1">
                {t.occupied}/{t.total}
              </p>
              <p className="text-sm text-gray-600">Vacant: {t.vacant}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
