import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ConsultationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stList, setStList] = useState([]);

  useEffect(() => {
    fetchData();
    axios.get('http://localhost:5000/api/auth/sts').then(res => setStList(res.data));
  }, []);

  const fetchData = () => {
    axios.get('http://localhost:5000/api/consultations/my-consultations')
      .then(res => setRequests(res.data))
      .catch(() => alert('Failed to load'));
  };

  const handleAction = async (id: string, status: string, assignedSTs: string[] = []) => {
    try {
      await axios.put(`http://localhost:5000/api/consultations/${id}`, { status, assignedSTs });
      fetchData();
    } catch (e) {
      alert('Error updating status');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Incoming Requests</h2>
      <div className="space-y-4">
        {requests.map((req: any) => (
          <div key={req._id} className="bg-white p-6 rounded shadow border">
            <h3 className="font-bold text-lg">{req.reason}</h3>
            <p>Student: {req.requester?.name}</p>
            <p>Time: {new Date(req.preferredStart).toLocaleString()} - {new Date(req.preferredEnd).toLocaleString()}</p>
            <p className="mt-2 text-sm">Status: <span className="uppercase font-bold">{req.status}</span></p>
            
            {req.status === 'requested' && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 font-medium">Assign an ST (Optional):</p>
                <select id={`st-${req._id}`} className="p-2 border rounded mb-4 w-full max-w-sm">
                  <option value="">-- No ST Assisted --</option>
                  {stList.map((st: any) => <option key={st._id} value={st._id}>{st.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const stId = (document.getElementById(`st-${req._id}`) as HTMLSelectElement).value;
                    handleAction(req._id, 'accepted', stId ? [stId] : []);
                  }} className="bg-green-600 text-white px-4 py-2 rounded">Accept & Assign</button>
                  <button onClick={() => handleAction(req._id, 'declined')} className="bg-red-600 text-white px-4 py-2 rounded">Decline</button>
                </div>
              </div>
            )}
            {req.status === 'accepted' && req.assignedSTs?.length > 0 && (
              <p className="mt-2 text-blue-600 font-medium">Assigned ST: {req.assignedSTs.map((s:any)=>s.name).join(', ')}</p>
            )}
          </div>
        ))}
        {requests.length === 0 && <p>No incoming requests.</p>}
      </div>
    </div>
  );
};
export default ConsultationRequests;
