import { useState } from 'react';
import { ArrowLeft, Calendar, User, Building2, Clock, UserPlus, Star } from 'lucide-react';
import type { UserRole, Project, Evaluation } from '../App';
import { ProjectEvaluationTab } from './ProjectEvaluationTab';
import { projectApi } from '../services/projectService';
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
}

type TabView = 'overview' | 'resources' | 'timeline' | 'evaluations';

export function ProjectDetails({
  projectId,
  userRole,
  currentUserId,
  onBack,
  projects,
  evaluations,
  onSubmitEvaluation,
  onAssignEvaluation
}: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [evaluationForm, setEvaluationForm] = useState({
    marks: '',
    remarks: '',
    status: 'approved'
  });
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  
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

  const projectEvaluations = evaluations.filter((e) => e.projectId === projectId);
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
          {userRole === 'faculty' && !isAlreadyAssigned && (
            <button
              onClick={handleAssignToEvaluate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Assign Myself to Evaluate
            </button>
          )}
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
                {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
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
                      <span className="text-gray-600">Student ID</span>
                      <span className="text-gray-900">{project.studentId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Supervisor</span>
                      <span className="text-gray-900">{project.supervisor}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Department</span>
                      <span className="text-gray-900">{project.department}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-900 mb-3">Evaluation Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Total Assessors</span>
                      <span className="text-gray-900">{projectEvaluations.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Submitted</span>
                      <span className="text-gray-900">{submittedEvaluations.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Average Score</span>
                      <span className="text-gray-900">
                        {avgScore !== null ? `${avgScore.toFixed(1)}/100` : 'Pending'}
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
            <ProjectEvaluationTab
              project={project}
              userRole={userRole}
              currentUserId={currentUserId}
              evaluations={evaluations}
              onSubmitEvaluation={onSubmitEvaluation}
            />
          )}

          {/* Faculty Evaluation Form */}
          {userRole === 'faculty' && project.supervisor === 'demo-faculty-1' && !project.evaluation && (
            <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Evaluate Project</h3>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingEvaluation(true);

                try {
                  const evaluationData = {
                    marks: parseInt(evaluationForm.marks),
                    remarks: evaluationForm.remarks,
                    status: evaluationForm.status
                  };

                  await projectApi.evaluateProject(project.id, evaluationData);
                  toast.success('Project evaluated successfully!');

                  // Refresh the page or update state
                  window.location.reload();
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to submit evaluation');
                } finally {
                  setIsSubmittingEvaluation(false);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks (0-100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={evaluationForm.marks}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, marks: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={evaluationForm.status}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="submitted">Submitted</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={evaluationForm.remarks}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, remarks: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter your evaluation remarks..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingEvaluation}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingEvaluation ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Show Evaluation Results */}
          {project.evaluation && (
            <div className="mt-6 bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Evaluation Results</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Marks</p>
                  <p className="text-2xl font-bold text-green-600">{project.evaluation.marks}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600 capitalize">{project.status}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Remarks</p>
                <div className="text-gray-700 bg-white p-3 rounded border break-words whitespace-pre-wrap">{project.evaluation.remarks}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
