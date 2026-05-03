import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Shield, Star, Edit3, Save, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ScoreSet {
  criteria1: number;
  criteria2: number;
  criteria3: number;
  criteria4: number;
}

interface EvaluationEntry {
  _id: string;
  assessorId: { _id: string; name: string };
  assessorRole: string;
  scores: ScoreSet;
  comments: string;
  submittedAt: string;
}

interface EvaluationPanelProps {
  projectId: string;
  stage: string;
  userRole: string;
  projectName: string;
}

export function EvaluationPanel({ projectId, stage, userRole, projectName }: EvaluationPanelProps) {
  const [panelData, setPanelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formScores, setFormScores] = useState<ScoreSet>({
    criteria1: 0,
    criteria2: 0,
    criteria3: 0,
    criteria4: 0
  });
  const [comments, setComments] = useState('');
  const [selectedRole, setSelectedRole] = useState('Supervisor');

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
  const currentUserId = localStorage.getItem('userId') || 'demo-faculty-1';

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/multilevel-evaluations/${projectId}?stage=${stage}`, {
        headers: { 'x-user-id': currentUserId, 'x-user-role': userRole }
      });
      const data = response.data.find((p: any) => p.stage === stage);
      setPanelData(data || null);
      
      // If user has already evaluated, pre-fill form for editing
      if (data) {
        const myEval = data.evaluations.find((e: any) => e.assessorId._id === currentUserId || e.assessorId === currentUserId);
        if (myEval) {
          setFormScores(myEval.scores);
          setComments(myEval.comments);
          setSelectedRole(myEval.assessorRole);
        }
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [projectId, stage]);

  const myEvaluation = useMemo(() => {
    if (!panelData) return null;
    return panelData.evaluations.find((e: any) => 
      (e.assessorId._id || e.assessorId) === currentUserId
    );
  }, [panelData, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        stage,
        scores: formScores,
        comments,
        assessorRole: selectedRole
      };

      if (myEvaluation && isEditing) {
        await axios.put(`${API_BASE}/multilevel-evaluations/${projectId}/${myEvaluation._id}`, payload, {
          headers: { 'x-user-id': currentUserId, 'x-user-role': userRole }
        });
        toast.success('Evaluation updated successfully');
      } else {
        await axios.post(`${API_BASE}/multilevel-evaluations/${projectId}`, payload, {
          headers: { 'x-user-id': currentUserId, 'x-user-role': userRole }
        });
        toast.success('Evaluation submitted successfully');
      }
      
      setIsEditing(false);
      fetchEvaluations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit evaluation');
    }
  };

  const getSummaryColor = (label: string) => {
    switch (label) {
      case 'Excellent': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Good': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Needs Improvement': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Unsatisfactory': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading evaluation panel...</div>;

  return (
    <div className="space-y-6 apcms-stagger">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Evaluation Panel — {stage}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{projectName}</p>
        </div>
      </div>

      {/* Middle Section: Evaluations List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-6 py-4 font-medium">Assessor</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Avg Score</th>
              <th className="px-6 py-4 font-medium">Feedback Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {panelData?.evaluations.map((entry: any) => {
              const avg = (entry.scores.criteria1 + entry.scores.criteria2 + entry.scores.criteria3 + entry.scores.criteria4) / 4;
              return (
                <React.Fragment key={entry._id}>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{entry.assessorId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{entry.assessorRole.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${avg}%` }} />
                        </div>
                        <span className="font-semibold">{avg}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 italic">
                        {entry.comments || 'No written feedback'}
                      </div>
                    </td>
                  </tr>
                  {entry.comments && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={4} className="px-6 py-3">
                        <div className="flex gap-3 items-start">
                          <div className="mt-1 p-1 bg-blue-100 rounded text-blue-600">
                            <Star className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-tight mb-1">Detailed Remarks</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{entry.comments}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {(!panelData || panelData.evaluations.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  No evaluations submitted for this stage yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Card */}
      {panelData && (
        <div className={`p-6 rounded-xl border flex items-center justify-between shadow-lg ${getSummaryColor(panelData.summary)}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-3xl font-black">{panelData.averageScore}</span>
            </div>
            <div>
              <h4 className="font-bold text-lg leading-tight">Overall Performance</h4>
              <p className="opacity-80 text-sm">Calculated from {panelData.evaluations.length} assessments</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getSummaryColor(panelData.summary)}`}>
              {panelData.summary.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Evaluation Form / Edit Section */}
      {userRole !== 'student' && (!myEvaluation || isEditing) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> 
                {myEvaluation ? 'Update Assessment' : 'New Assessment'}
              </h4>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-bold uppercase">Role:</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-sm border-gray-200 rounded-lg py-1 px-2 bg-gray-50"
                >
                  <option value="Supervisor">Supervisor</option>
                  <option value="Co-Supervisor">Co-Supervisor</option>
                  <option value="ST">ST</option>
                  <option value="RA">RA</option>
                  <option value="TA">TA</option>
                  <option value="External Examiner">External Examiner</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { key: 'criteria1', label: 'Methodology & Research' },
                { key: 'criteria2', label: 'Presentation & Communication' },
                { key: 'criteria3', label: 'Innovation & Implementation' },
                { key: 'criteria4', label: 'Documentation & Ethics' }
              ].map((crit) => (
                <div key={crit.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">{crit.label}</label>
                    <span className="text-sm font-black text-blue-600">{formScores[crit.key as keyof ScoreSet]} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formScores[crit.key as keyof ScoreSet]}
                    onChange={(e) => setFormScores({...formScores, [crit.key]: parseInt(e.target.value)})}
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Detailed Feedback / Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide constructive feedback for the students..."
                className="w-full h-32 p-3 border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end">
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {myEvaluation ? 'Save Changes' : 'Submit Evaluation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {myEvaluation && !isEditing && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg text-white">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Your Assessment Submitted</h4>
              <p className="text-sm text-gray-600">You gave this project an average of { (myEvaluation.scores.criteria1 + myEvaluation.scores.criteria2 + myEvaluation.scores.criteria3 + myEvaluation.scores.criteria4) / 4 } for this stage.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-blue-200 text-blue-600 font-bold rounded-lg hover:bg-white transition-all flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Edit My Score
          </button>
        </div>
      )}
    </div>
  );
}
