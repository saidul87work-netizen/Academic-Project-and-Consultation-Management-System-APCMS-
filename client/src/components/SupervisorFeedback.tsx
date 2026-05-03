import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Calendar, Send, Loader2, ChevronDown, Users, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface UnifiedFeedback {
  id: string;
  source: 'supervisor' | 'evaluator';
  authorName: string;
  stage: string;
  message: string;
  createdAt: string;
  score?: number;
}

const STAGES = ['Planning','Proposal','Development','Testing','Submission','Defense','Final Review'];

const SOURCE_COLORS = {
  supervisor: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', icon: MessageSquare },
  evaluator: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: Shield },
};

export function SupervisorFeedback({
  teamId,
  currentUserId,
  userRole,
  projectId,
}: {
  teamId?: string;
  currentUserId: string;
  userRole?: string;
  projectId?: string;
}) {
  const [feedbackList, setFeedbackList] = useState<UnifiedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedTeamId, setResolvedTeamId] = useState<string | null>(teamId || null);
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState(STAGES[0]);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
  const isFacultyOrAdmin = userRole === 'faculty' || userRole === 'admin';

  const fetchData = async (tid: string | null, pid: string | null) => {
    try {
      let combined: UnifiedFeedback[] = [];

      // 1. Fetch Supervisor Feedback from Team
      if (tid) {
        try {
          const res = await axios.get(`${API_BASE}/teams/${tid}/feedback`, {
            headers: { 'x-user-id': currentUserId, 'x-user-role': userRole || 'student' },
          });
          const teamFeedback: UnifiedFeedback[] = res.data.map((f: any) => ({
            id: f._id,
            source: 'supervisor',
            authorName: f.supervisorName || 'Faculty Supervisor',
            stage: f.stage || 'General',
            message: f.message,
            createdAt: f.createdAt,
          }));
          combined = [...combined, ...teamFeedback];
        } catch (err) { console.error("Team feedback fetch failed", err); }
      }

      // 2. Fetch Multi-Level Evaluation Comments
      if (pid) {
        try {
          const res = await axios.get(`${API_BASE}/multilevel-evaluations/${pid}`, {
            headers: { 'x-user-id': currentUserId, 'x-user-role': userRole || 'student' },
          });
          // res.data is an array of panels (one per stage)
          res.data.forEach((panel: any) => {
            const evals: UnifiedFeedback[] = panel.evaluations
              .filter((e: any) => e.comments && e.comments.trim() !== '')
              .map((e: any) => {
                const avg = (e.scores.criteria1 + e.scores.criteria2 + e.scores.criteria3 + e.scores.criteria4) / 4;
                return {
                  id: e._id,
                  source: 'evaluator',
                  authorName: e.assessorId?.name || 'Assessor',
                  stage: panel.stage,
                  message: e.comments,
                  createdAt: e.submittedAt,
                  score: avg
                };
              });
            combined = [...combined, ...evals];
          });
        } catch (err) { console.error("Evaluation feedback fetch failed", err); }
      }

      // Sort by date descending
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFeedbackList(combined);
    } catch (err: any) {
      console.error('Failed to fetch unified feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      let tid = teamId;

      if (!tid && projectId) {
        try {
          const res = await axios.get(`${API_BASE}/teams/project/${projectId}`, {
            headers: { 'x-user-id': currentUserId, 'x-user-role': userRole || 'student' },
          });
          tid = res.data?._id;
          setResolvedTeamId(tid || null);
        } catch {
          setResolvedTeamId(null);
        }
      }
      
      await fetchData(tid || null, projectId || null);
    };
    init();
  }, [teamId, projectId, userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !resolvedTeamId) {
      if (!resolvedTeamId) toast.error("Cannot post feedback: Team not found");
      return;
    }
    setSubmitting(true);
    try {
      const supervisorName = localStorage.getItem('userName') || 'Faculty';
      await axios.post(
        `${API_BASE}/teams/${resolvedTeamId}/feedback`,
        { message, stage, supervisorName },
        { headers: { 'x-user-id': currentUserId, 'x-user-role': userRole || 'faculty' } }
      );
      toast.success('Feedback submitted to team wall');
      setMessage('');
      await fetchData(resolvedTeamId, projectId || null);
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-400 animate-pulse">Fetching unified feedback feed...</div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-500" />
        <h3 className="text-xl font-bold text-gray-900">Project Feedback Feed</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {feedbackList.length} total entries
        </span>
      </div>

      <p className="text-sm text-gray-500 -mt-4">
        Showing all supervisor notes and qualitative evaluation comments in one place.
      </p>

      {/* Write Form — faculty/admin only */}
      {isFacultyOrAdmin && (
        <form onSubmit={handleSubmit} className="bg-purple-50 border border-purple-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-widest">New Supervisor Note</p>
            {!resolvedTeamId && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 italic">Posting disabled: Team missing</span>}
          </div>

          <div className="relative">
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 rounded-xl border border-purple-200 bg-white text-sm font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
          </div>

          <textarea
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write a supervisor note for the team..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-white text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="submit"
            disabled={submitting || !message.trim() || !resolvedTeamId}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Post Note'}
          </button>
        </form>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 italic">No feedback entries found from any source yet.</p>
          </div>
        ) : (
          feedbackList.map((item) => {
            const config = SOURCE_COLORS[item.source];
            const Icon = config.icon;
            const initials = item.authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex items-stretch">
                  {/* Left Source Bar */}
                  <div className="w-1.5" style={{ backgroundColor: config.text }} />
                  
                  <div className="flex-1 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontSize: 9, fontWeight: 900, textTransform: 'uppercase', 
                          letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4,
                          backgroundColor: config.bg, color: config.text, border: `1px solid ${config.border}`
                        }}>
                          {item.source}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.stage}</span>
                      </div>
                      {item.score !== undefined && (
                        <div className="flex items-center gap-1 text-xs font-black text-blue-600">
                          <Star className="w-3 h-3 fill-blue-600" />
                          {item.score.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-800 leading-relaxed text-sm mb-4">{item.message}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: config.text }}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{item.authorName}</p>
                          <p className="text-[9px] text-gray-400">{item.source === 'supervisor' ? 'Team Supervisor' : 'Panel Assessor'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
