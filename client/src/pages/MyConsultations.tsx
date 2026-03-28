import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyConsultations = () => {
  const [data, setData] = useState([]);
  const [feedbackState, setFeedbackState] = useState<{id: string, rating: number, comment: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/consultations/my-consultations');
      setData(res.data);
    } catch {
      alert('Failed to load');
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackState) return;
    try {
      await axios.put(`http://localhost:5000/api/consultations/${feedbackState.id}/feedback`, {
        rating: feedbackState.rating,
        comment: feedbackState.comment
      });
      setFeedbackState(null);
      fetchData();
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Consultations</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((c: any) => (
          <div key={c._id} className="bg-white p-6 rounded shadow border">
            <h3 className="font-bold text-lg mb-2">{c.reason}</h3>
            <p>Faculty: {c.faculty?.name}</p>
            <p>Time: {new Date(c.preferredStart).toLocaleString()}</p>
            <p>Status: <span className="font-bold uppercase text-blue-600">{c.status}</span></p>

            {c.status === 'accepted' && c.assignedSTs?.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded border">
                <p className="font-medium text-sm text-gray-700">Assisted by ST: {c.assignedSTs.map((st:any)=>st.name).join(', ')}</p>
                {!c.feedbackForST?.submittedAt ? (
                  feedbackState?.id === c._id ? (
                    <form onSubmit={submitFeedback} className="mt-4 space-y-2">
                      <select required className="w-full p-2 border rounded text-sm" value={feedbackState.rating} onChange={e => setFeedbackState({...feedbackState, rating: Number(e.target.value)})}>
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - Average</option>
                        <option value={2}>2 - Poor</option>
                        <option value={1}>1 - Terrible</option>
                      </select>
                      <textarea required className="w-full p-2 border rounded" placeholder="Add comments..." value={feedbackState.comment} onChange={e => setFeedbackState({...feedbackState, comment: e.target.value})} />
                      <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm w-full">Submit Feedback</button>
                        <button type="button" onClick={() => setFeedbackState(null)} className="w-full bg-gray-300 px-3 py-1 text-sm rounded">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setFeedbackState({id: c._id, rating: 5, comment: ''})} className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium">Leave Feedback for ST</button>
                  )
                ) : (
                  <p className="mt-2 text-sm text-green-600 font-medium">✓ Feedback submitted ({c.feedbackForST.rating}/5 stars)</p>
                )}
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-500">No consultations to show.</p>}
      </div>
    </div>
  );
};
export default MyConsultations;
