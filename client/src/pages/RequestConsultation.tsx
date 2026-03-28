import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RequestConsultation = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({ facultyId: '', reason: '', startDate: '', endDate: '' });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/faculty').then(res => setFacultyList(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/consultations/request', {
        faculty: formData.facultyId,
        reason: formData.reason,
        preferredStart: formData.startDate,
        preferredEnd: formData.endDate
      });
      alert('Request sent!');
      navigate('/my-consultations');
    } catch (err) {
      alert('Failed to send request');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Request Consultation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Topic / Reason</label>
          <input className="w-full border p-2 rounded" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Select Faculty</label>
          <select className="w-full border p-2 rounded" required value={formData.facultyId} onChange={e => setFormData({...formData, facultyId: e.target.value})}>
            <option value="">-- Choose --</option>
            {facultyList.map((f: any) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Preferred Start time</label>
          <input type="datetime-local" className="w-full border p-2 rounded" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Preferred End time</label>
          <input type="datetime-local" className="w-full border p-2 rounded" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Submit Request</button>
      </form>
    </div>
  );
};
export default RequestConsultation;
