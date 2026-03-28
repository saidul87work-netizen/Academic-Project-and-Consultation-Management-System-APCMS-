import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  const isStudent = user?.roles.includes('student');
  const isFaculty = user?.roles.includes('faculty');

  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <div className="font-bold text-xl text-blue-600">
        <Link to="/dashboard">Consultation Phase 1</Link>
      </div>
      <div className="flex gap-6 items-center">
        {isStudent && (
          <>
            <Link to="/request-consultation" className="text-gray-600 hover:text-blue-500 font-medium">Request</Link>
            <Link to="/my-consultations" className="text-gray-600 hover:text-blue-500 font-medium">My Consultations</Link>
          </>
        )}
        {isFaculty && (
          <>
            <Link to="/manage-requests" className="text-gray-600 hover:text-blue-500 font-medium">Manage Requests</Link>
            <Link to="/schedule" className="text-gray-600 hover:text-blue-500 font-medium">My Schedule</Link>
          </>
        )}
        <button onClick={logout} className="ml-4 px-4 py-2 border rounded-md text-red-600 border-red-200 hover:bg-red-50 text-sm">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
