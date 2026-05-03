import { ArrowLeft, Download, Printer, User, Award, TrendingUp, MessageSquare, Loader2, CheckCircle2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Project, UserRole, Evaluation } from '../App';
import axios from 'axios';
import { toast } from 'sonner';

interface EvaluationSummaryPageProps {
  project: Project;
  userRole: UserRole;
  onBack: () => void;
}

interface MultiLevelEvalEntry {
  _id: string;
  assessorId: { _id: string; name: string };
  assessorRole: string;
  scores: {
    criteria1: number;
    criteria2: number;
    criteria3: number;
    criteria4: number;
  };
  comments: string;
  submittedAt: string;
}

interface MultiLevelPanel {
  _id: string;
  stage: string;
  averageScore: number;
  summary: string;
  evaluations: MultiLevelEvalEntry[];
}

interface TeamMember {
  studentId: { _id: string; name: string; email: string; universityId?: string };
  role: 'leader' | 'member';
  status: string;
}

interface TeamInfo {
  _id: string;
  teamName: string;
  members: TeamMember[];
}

export function EvaluationSummaryPage({ project, userRole, onBack }: EvaluationSummaryPageProps) {
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState<MultiLevelPanel[]>([]);
  const [activeStage, setActiveStage] = useState(project.stage || 'Proposal');
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
        const currentUserId = localStorage.getItem('userId');
        
        // Fetch multi-level evaluations
        const res = await axios.get(`${API_BASE}/multilevel-evaluations/${project.id}`, {
          headers: { 'x-user-id': currentUserId }
        });
        setPanels(res.data);

        // Fetch team info for this project
        try {
          const teamRes = await axios.get(`${API_BASE}/teams/project/${project.id}`, {
            headers: { 'x-user-id': currentUserId, 'x-user-role': localStorage.getItem('userRole') }
          });
          if (teamRes.data) setTeamInfo(teamRes.data);
        } catch {
          // No team for this project - that's fine
        }
      } catch (error) {
        console.error('Summary: Error fetching data:', error);
        toast.error('Failed to load evaluation data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [project.id]);

  const currentPanel = panels.find(p => p.stage === activeStage);
  const averageTotalScore = currentPanel?.averageScore || 0;
  const submittedEvaluations = currentPanel?.evaluations || [];

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-300' };
    if (score >= 70) return { grade: 'B', label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 55) return { grade: 'C', label: 'Satisfactory', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (score >= 40) return { grade: 'D', label: 'Pass', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { grade: 'F', label: 'Fail', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const finalGrade = getGrade(averageTotalScore);

  const handlePrint = () => { window.print(); };
  const handleExportPDF = () => { toast.info('Preparing PDF export...'); };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-600 font-medium">Synchronizing evaluation data from server...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold">
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 print:hidden">
        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Stage:</span>
        <div className="flex gap-2">
          {['Proposal', 'Midterm', 'Final'].map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeStage === s 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {s}
              {panels.some(p => p.stage === s && p.evaluations.length > 0) && (
                <CheckCircle2 className="w-3 h-3 inline-block ml-1.5 text-blue-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Banner */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        
        <div className="p-8 md:p-12">
          {/* Main Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-100 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-black text-gray-900">Project Evaluation Summary</h1>
              </div>
              <p className="text-gray-500 font-medium text-lg">Report for Stage: <span className="text-blue-600 font-black">{activeStage}</span></p>
            </div>
            <div className={`px-8 py-4 rounded-2xl border-4 flex flex-col items-center justify-center min-w-[140px] transition-all transform hover:rotate-2 ${finalGrade.color}`}>
              <span className="text-5xl font-black">{finalGrade.grade}</span>
              <span className="text-xs font-black uppercase tracking-widest mt-1 opacity-80">{finalGrade.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Project Info */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <User className="w-4 h-4" /> Project Metadata
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Title</p>
                      <p className="text-gray-900 font-bold leading-tight">{project.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Student</p>
                        <p className="text-gray-900 font-medium">{project.studentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Department</p>
                        <p className="text-gray-900 font-medium">{project.department}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Supervisor</p>
                      <p className="text-gray-900 font-medium">{project.supervisor}</p>
                    </div>
                  </div>
                </div>

                {/* Team Info Section */}
                {teamInfo && (
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Team Information
                    </h3>
                    <div className="mb-3">
                      <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Team Name</p>
                      <p className="text-indigo-900 font-bold text-lg">{teamInfo.teamName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-400 font-bold uppercase mb-2">Members</p>
                      <div className="space-y-2">
                        {teamInfo.members
                          .filter(m => m.status === 'active')
                          .map((m, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-black text-indigo-700">
                                {m.studentId?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-indigo-900">{m.studentId?.name || 'Unknown'}</p>
                                <p className="text-xs text-indigo-400 capitalize">{m.role}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              
              {/* Score Highlight */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Stage Average</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black">{averageTotalScore}</span>
                  <span className="text-xl opacity-50 font-bold">/100</span>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm font-medium opacity-80">
                    Compiled from <span className="text-blue-400 font-bold">{submittedEvaluations.length}</span> individual assessments for the {activeStage} stage.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Detailed Breakdown */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Detailed Assessment Breakdown
                </h3>
                
                {submittedEvaluations.length > 0 ? (
                  <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Assessor</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4 text-right">Avg Score</th>
                          <th className="px-6 py-4 text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {submittedEvaluations.map((entry) => {
                          const avg = (entry.scores.criteria1 + entry.scores.criteria2 + entry.scores.criteria3 + entry.scores.criteria4) / 4;
                          const g = getGrade(avg);
                          return (
                            <tr key={entry._id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {entry.assessorId?.name || 'Assessor'}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-black px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase">
                                  {entry.assessorRole}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-black text-lg text-gray-900">{avg}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-xs font-black px-3 py-1 rounded-full border-2 ${g.color}`}>
                                  {g.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No assessments submitted for the {activeStage} stage yet.</p>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {submittedEvaluations.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Evaluator Feedback
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submittedEvaluations.map((entry) => (
                      <div key={entry._id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-black text-gray-900">{entry.assessorId?.name || 'Evaluator'}</p>
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">{entry.assessorRole}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed italic">"{entry.comments || 'No specific feedback provided.'}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-8 text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-[10px] text-gray-400 font-bold">Academic Project & Consultation Management System (APCMS)</p>
        </div>
      </div>
    </div>
  );
}