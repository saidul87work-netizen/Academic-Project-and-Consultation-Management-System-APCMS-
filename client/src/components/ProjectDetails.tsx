import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Building2, Clock, Star } from 'lucide-react';
import type { UserRole, Project, Evaluation } from '../App';
import { ProjectEvaluationTab } from './ProjectEvaluationTab';
import { EvaluationPanel } from './EvaluationPanel';
import { TeamPanel } from './TeamPanel';
import { SharedSubmissions } from './SharedSubmissions';
import { TeamMessages } from './TeamMessages';
import { SupervisorFeedback } from './SupervisorFeedback';
import { ProjectCalendar } from './ProjectCalendar';
import { ProjectHistory } from './ProjectHistory';
import { projectApi } from '../services/projectService';
import axios from 'axios';
import { toast } from 'sonner';

interface ProjectDetailsProps {
  projectId: string;
  userRole: UserRole;
  currentUserId: string;
  onBack: () => void;
  projects: Project[];
  evaluations: Evaluation[];
  onSubmitEvaluation: (evaluation: Evaluation) => void;
  onAssignEvaluation: (projectId: string, facultyName: string, facultyId: string) => void;
  onStatusUpdate?: () => void;
}

type TabView = 'overview' | 'resources' | 'timeline' | 'evaluations' | 'team' | 'submissions' | 'messages' | 'feedback' | 'calendar' | 'history';

export function ProjectDetails({
  projectId,
  userRole,
  currentUserId,
  onBack,
  projects,
  evaluations,
  onSubmitEvaluation,
  onAssignEvaluation,
  onStatusUpdate
}: ProjectDetailsProps) {
  console.log('🏗️ ProjectDetails: Mounting with ID:', projectId);
  
  const project = projects.find((p) => p.id === projectId);
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [currentStage, setCurrentStage] = useState('Proposal');
  const [team, setTeam] = useState<any>(null);
  const [evaluationForm, setEvaluationForm] = useState({
    marks: '',
    remarks: '',
    status: 'approved'
  });

  const [panelSummary, setPanelSummary] = useState({ total: 0, average: 0, status: 'Pending' });

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !currentUserId) return;
      
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
        
        // 1. Fetch Team
        const teamRes = await axios.get(`${API_BASE}/teams/project/${projectId}`, {
          headers: { 'x-user-id': currentUserId, 'x-user-role': userRole }
        });
        setTeam(teamRes.data);

        // 2. Fetch Multi-Level Evaluation Summary
        const stageParam = project?.stage || 'Proposal';
        const evalRes = await axios.get(`${API_BASE}/multilevel-evaluations/${projectId}?stage=${stageParam}`, {
          headers: { 'x-user-id': currentUserId }
        });
        const stageData = evalRes.data.find((d: any) => d.stage === stageParam);
        if (stageData) {
          setPanelSummary({
            total: stageData.evaluations.length,
            average: stageData.averageScore,
            status: stageData.summary
          });
        }
      } catch (error) {
        console.error('Error fetching supplementary project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId, currentUserId, project?.stage, userRole]);

  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);

  if (!project) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Project not found</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  const projectEvaluations = evaluations.filter((e) => String(e.projectId) === String(projectId));
  console.log(`📊 ProjectDetails: Filtering evaluations for ${projectId}. Found ${projectEvaluations.length} total evaluations.`);
  
  const submittedEvaluations = projectEvaluations.filter((e) => e.status === 'Submitted');
  const avgScore =
    submittedEvaluations.length > 0
      ? submittedEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / submittedEvaluations.length
      : null;

  // Check if current faculty is already assigned to this project
  const isAlreadyAssigned = projectEvaluations.some((e) => e.assessorId === currentUserId);

  const handleAssignToEvaluate = () => {
    if (userRole === 'faculty' && !isAlreadyAssigned) {
      onAssignEvaluation(projectId, 'Dr. Sarah Johnson', currentUserId);
      alert('You have been assigned to evaluate this project!');
      setActiveTab('evaluations');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-gray-900">{project.title}</h2>
          <p className="text-gray-600 mt-1">Project ID: {project.id}</p>
        </div>
        <div className="flex items-center gap-3">

          <span
            className={`px-4 py-2 rounded-lg text-sm ${
              project.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : project.status === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : project.status === 'Review'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Project Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Student</p>
              <p className="text-gray-900 mt-1">{project.studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Department</p>
              <p className="text-gray-900 mt-1">{project.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Start Date</p>
              <p className="text-gray-900 mt-1">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Due Date</p>
              <p className="text-gray-900 mt-1">
                {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </p>
            </div>
          </div>

          {/* Quick Action: Complete Project */}
          {(userRole === 'faculty' || userRole === 'admin') && project.status !== 'Completed' && (
            <div className="flex justify-end mt-4 md:mt-0">
              <button
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to mark this project as COMPLETED?")) return;
                  try {
                    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
                    await axios.put(`${API_BASE}/projects/${projectId}`, { status: 'completed' }, {
                      headers: { 'x-user-id': currentUserId, 'x-user-role': userRole }
                    });
                    toast.success("Project marked as COMPLETED!");
                    if (onStatusUpdate) onStatusUpdate();
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || "Failed to update project status");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold shadow-sm"
              >
                <Star className="w-4 h-4 fill-white" />
                Complete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`px-6 py-4 border-b-2 transition-colors relative ${
                activeTab === 'evaluations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Evaluations
              {projectEvaluations.some((e) => e.status === 'Pending') && (
                <span className="absolute top-3 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </button>
            {userRole === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'team'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Team
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'submissions'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'messages'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-6 py-4 border-b-2 transition-colors ${
                    activeTab === 'feedback'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Feedback
                </button>
              </>
            )}
            {/* Faculty/Admin also get Messages tab when a team exists */}
            {(userRole === 'faculty' || userRole === 'admin') && team && (
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Messages
              </button>
            )}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-900 mb-3">Project Description</h3>
                <div className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{project.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-900 mb-3">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Student Name</span>
                      <span className="text-gray-900 font-bold text-emerald-500">{project.studentName || 'Not Assigned'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Supervisor</span>
                      <span className="text-gray-900">{project.supervisor}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Department</span>
                      <span className="text-gray-900">{project.department}</span>
                    </div>
                    {team && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Team</span>
                        <span className="text-indigo-600 font-bold">{team.teamName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-900 mb-3">Evaluation Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Total Assessors</span>
                      <span className="text-gray-900 font-bold text-blue-500">{panelSummary.total}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Stage Status</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                        panelSummary.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                        panelSummary.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                        panelSummary.status === 'Needs Improvement' ? 'bg-amber-100 text-amber-700' :
                        panelSummary.status === 'Unsatisfactory' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {panelSummary.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Average Score</span>
                      <span className="text-gray-900 font-black text-xl text-emerald-500">
                        {panelSummary.total > 0 ? `${panelSummary.average}/100` : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'resources' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Resources section - Coming soon</p>
              <p className="text-sm text-gray-400 mt-2">Project files, documents, and links will appear here</p>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-gray-900">Project Started</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-gray-900">Expected Completion</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-8">
              {/* Stage Selector */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Project Stage:</span>
                <div className="flex gap-2">
                  {['Proposal', 'Midterm', 'Final'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setCurrentStage(s)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                        currentStage === s
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <EvaluationPanel 
                projectId={project.id}
                stage={currentStage}
                userRole={userRole}
                projectName={project.title}
              />
              
              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Legacy Evaluations</h4>
                <ProjectEvaluationTab
                  project={project}
                  userRole={userRole}
                  currentUserId={currentUserId}
                  evaluations={evaluations}
                  onSubmitEvaluation={onSubmitEvaluation}
                />
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <TeamPanel projectId={project.id} currentUserId={currentUserId} />
          )}

          {activeTab === 'submissions' && team && (
            <SharedSubmissions teamId={team._id} currentUserId={currentUserId} />
          )}

          {activeTab === 'messages' && team && (
            <TeamMessages teamId={team._id} currentUserId={currentUserId} />
          )}

          {activeTab === 'feedback' && (
            <SupervisorFeedback teamId={team?._id} currentUserId={currentUserId} userRole={userRole} projectId={projectId} />
          )}

          {activeTab === 'calendar' && (
            <ProjectCalendar 
              projectId={projectId} 
              userRole={userRole} 
              currentUserId={currentUserId} 
            />
          )}

          {activeTab === 'history' && (
            <ProjectHistory 
              projectId={projectId} 
              currentUserId={currentUserId} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
