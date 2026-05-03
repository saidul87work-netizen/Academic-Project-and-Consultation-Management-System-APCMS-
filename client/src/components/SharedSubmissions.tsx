import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  _id: string;
  studentName: string;
  title: string;
  fileUrl?: string;
  link?: string;
  stage: string;
  submittedAt: string;
}

export function SharedSubmissions({ teamId, currentUserId }: { teamId: string; currentUserId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newSub, setNewSub] = useState({ title: '', link: '', stage: 'Proposal' });

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teams/${teamId}/submissions`, {
        headers: { 'x-user-id': currentUserId }
      });
      setSubmissions(res.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/teams/${teamId}/submission`, newSub, {
        headers: { 'x-user-id': currentUserId }
      });
      toast.success('Submission posted to team!');
      setNewSub({ title: '', link: '', stage: 'Proposal' });
      setIsUploading(false);
      fetchSubmissions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading submissions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Shared Submissions
        </h3>
        <button 
          onClick={() => setIsUploading(!isUploading)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" /> New Submission
        </button>
      </div>

      {isUploading && (
        <form onSubmit={handleSubmit} className="p-6 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-900">TITLE</label>
              <input 
                type="text" 
                required 
                value={newSub.title}
                onChange={(e) => setNewSub({...newSub, title: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border-blue-200"
                placeholder="e.g. Final Report"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-900">LINK (OPTIONAL)</label>
              <input 
                type="url" 
                value={newSub.link}
                onChange={(e) => setNewSub({...newSub, link: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border-blue-200"
                placeholder="Google Drive / GitHub"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-900">STAGE</label>
              <select 
                value={newSub.stage}
                onChange={(e) => setNewSub({...newSub, stage: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border-blue-200"
              >
                <option value="Proposal">Proposal</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsUploading(false)} className="px-4 py-2 text-blue-600 font-bold">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Post to Team</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {submissions.map((sub) => (
          <div key={sub._id} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{sub.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="font-bold text-blue-600 uppercase">{sub.stage}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(sub.submittedAt).toLocaleString()}</span>
                  <span>By {sub.studentName}</span>
                </div>
              </div>
            </div>
            {sub.link && (
              <a 
                href={sub.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-2 text-sm font-bold"
              >
                View Link <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic">No submissions yet.</div>
        )}
      </div>
    </div>
  );
}
