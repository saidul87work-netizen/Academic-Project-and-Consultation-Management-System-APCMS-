import { TrendingUp, FolderKanban, Calendar, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import type { PageView, UserRole, Project, Evaluation } from '../App';

interface DashboardProps {
  userRole: UserRole;
  onNavigate: (page: PageView) => void;
  onViewProject: (projectId: string) => void;
  projects: Project[];
  evaluations: Evaluation[];
}

export function Dashboard({ userRole, onNavigate, onViewProject, projects, evaluations }: DashboardProps) {
  // Calculate statistics
  const totalProjects = projects.length;
  const pendingEvaluations = evaluations.filter((e) => e.status === 'Pending').length;
  const completedEvaluations = evaluations.filter((e) => e.status === 'Submitted').length;

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-gray-900">
          Welcome back, {userRole === 'admin' ? 'Admin' : userRole === 'faculty' ? 'Teacher' : 'Student'}!
        </h2>
        <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-gray-900 text-2xl mt-2">{totalProjects}</p>
              <p className="text-green-600 text-xs mt-1">Active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Evaluations</p>
              <p className="text-gray-900 text-2xl mt-2">{pendingEvaluations}</p>
              <p className="text-amber-600 text-xs mt-1">Awaiting review</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-gray-900 text-2xl mt-2">{completedEvaluations}</p>
              <p className="text-green-600 text-xs mt-1">Submitted</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Score</p>
              <p className="text-gray-900 text-2xl mt-2">85.3</p>
              <p className="text-blue-600 text-xs mt-1">Across all projects</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Recent Projects</h3>
                <button
                  onClick={() => onNavigate('projects')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentProjects.map((project) => {
                const projectEvals = evaluations.filter((e) => e.projectId === project.id);
                const submittedEvals = projectEvals.filter((e) => e.status === 'Submitted');
                const avgScore =
                  submittedEvals.length > 0
                    ? submittedEvals.reduce((sum, e) => sum + e.totalScore, 0) / submittedEvals.length
                    : null;

                return (
                  <div
                    key={project.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewProject(project.id)}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 break-words pr-2">{project.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 truncate">{project.studentName} • {project.department}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {avgScore !== null && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="text-gray-900">{avgScore.toFixed(1)}/100</p>
                          </div>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            project.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('projects')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View All Projects
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className={`w-full px-4 py-3 text-white rounded-lg hover:opacity-90 transition-colors text-sm ${
                  userRole === 'student' ? 'bg-red-600 hover:bg-red-700' :
                  userRole === 'faculty' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-green-600 hover:bg-green-700'
                }`}
              >
                Add New Project
              </button>
              {userRole === 'faculty' && (
                <button
                  onClick={() => onNavigate('projects')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  My Evaluations
                </button>
              )}
              {userRole === 'admin' && (
                <button
                  onClick={() => onNavigate('users')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Manage Users
                </button>
              )}
              <button
                onClick={() => onNavigate('projects')}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                View Evaluations
              </button>
              {userRole !== 'faculty' && userRole !== 'admin' && (
                <button
                  onClick={() => onNavigate('reservations')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Book Room/Desk
                </button>
              )}
            </div>
          </div>

          {/* Alerts */}
          {userRole === 'faculty' && pendingEvaluations > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900">Pending Actions</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You have {pendingEvaluations} evaluation{pendingEvaluations !== 1 ? 's' : ''} pending review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
