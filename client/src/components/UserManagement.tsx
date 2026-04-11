import { Users, UserPlus, Shield } from 'lucide-react';

export function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Total Users</h3>
          <p className="text-2xl text-gray-900 mb-1">234</p>
          <p className="text-sm text-gray-600">Active accounts</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Assessors</h3>
          <p className="text-2xl text-gray-900 mb-1">18</p>
          <p className="text-sm text-gray-600">Faculty members</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Students</h3>
          <p className="text-2xl text-gray-900 mb-1">216</p>
          <p className="text-sm text-gray-600">Enrolled</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-2">User Management Interface</p>
        <p className="text-sm text-gray-400">This section would include user list, role management, and permissions configuration</p>
      </div>
    </div>
  );
}
