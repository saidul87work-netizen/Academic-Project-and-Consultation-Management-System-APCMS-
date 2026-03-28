import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('kingkor@student.campus.edu');
  const [password, setPassword] = useState('student123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (data.success) {
        login(data.token, data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white p-8 shadow-md rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-600">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Sign In
          </button>
        </form>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Demo faculty: sarah.johnson@campus.edu / faculty123</p>
          <p>Demo student: kingkor@student.campus.edu / student123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
