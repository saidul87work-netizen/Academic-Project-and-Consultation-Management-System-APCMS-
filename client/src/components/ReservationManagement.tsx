import { Calendar, MapPin, Clock } from 'lucide-react';

export function ReservationManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Room & Desk Booking</h2>
        <p className="text-gray-600 mt-1">Reserve workspaces and meeting rooms across campus</p>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Available Rooms</h3>
          <p className="text-2xl text-gray-900 mb-1">12</p>
          <p className="text-sm text-gray-600">Across 3 buildings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-gray-900 mb-2">My Bookings</h3>
          <p className="text-2xl text-gray-900 mb-1">3</p>
          <p className="text-sm text-gray-600">This week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Hours Booked</h3>
          <p className="text-2xl text-gray-900 mb-1">8.5</p>
          <p className="text-sm text-gray-600">This month</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-2">Room & Desk Booking Feature</p>
        <p className="text-sm text-gray-400">This section would include calendar view, room availability, and booking management</p>
      </div>
    </div>
  );
}
