import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, User, Filter, CheckCircle2, FileText, Star, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

interface HistoryEntry {
  _id: string;
  actorId: { _id: string; name: string };
  actorRole: string;
  action: 'submitted' | 'graded' | 'late_flagged' | 'feedback_given' | 'stage_updated' | 'member_added' | 'evaluated';
  details: string;
  metadata: any;
  timestamp: string;
}

export function ProjectHistory({ projectId, currentUserId }: { projectId: string; currentUserId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/history/${projectId}?action=${filter}`, {
        headers: { 'x-user-id': currentUserId }
      });
      setHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [projectId, filter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submitted': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'graded': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'late_flagged': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'feedback_given': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'evaluated': return <Star className="w-4 h-4 text-amber-500" />;
      case 'stage_updated': return <ArrowRight className="w-4 h-4 text-cyan-500" />;
      default: return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'graded': return 'bg-green-100 text-green-700';
      case 'late_flagged': return 'bg-rose-100 text-rose-700';
      case 'feedback_given': return 'bg-purple-100 text-purple-700';
      case 'evaluated': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && history.length === 0) return <div className="p-8 text-center animate-pulse text-gray-400">Reconstructing timeline...</div>;

  return (
    <div className="space-y-6 apcms-stagger">
      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Project History
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm font-bold bg-transparent border-none focus:ring-0 text-gray-600"
          >
            <option value="All">All Actions</option>
            <option value="submitted">Submissions</option>
            <option value="graded">Grading</option>
            <option value="late_flagged">Late Flags</option>
            <option value="feedback_given">Feedback</option>
            <option value="evaluated">Evaluations</option>
          </select>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {history.map((entry, index) => (
          <div key={entry._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            {/* Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow-md z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all group-hover:scale-110 group-hover:shadow-lg">
              {getActionIcon(entry.action)}
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all group-hover:border-blue-200 group-hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">{entry.actorId?.name || 'Unknown User'}</span>
                </div>
                <time className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" title={new Date(entry.timestamp).toLocaleString()}>
                  {timeAgo(entry.timestamp)}
                </time>
              </div>
              
              <div className="mb-2">
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${getActionBadge(entry.action)}`}>
                  {entry.action.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">{entry.details}</p>
              
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
                  {entry.metadata.stage && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Stage: {entry.metadata.stage}</span>}
                  {entry.metadata.averageScore !== undefined && <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Score: {entry.metadata.averageScore}</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 italic">No history recorded for this project yet.</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="text-center">
          <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full transition-all">Load Full History</button>
        </div>
      )}
    </div>
  );
}
