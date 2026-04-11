import { useState, useMemo } from 'react';
import { Search, Filter, Eye, FileEdit } from 'lucide-react';
import type { Project, UserRole, AssessorRole, EvaluationStatus, Evaluation } from '../App';
import { evaluationApi } from '../services/evaluationApi';

interface EvaluationDashboardProps {
  userRole: UserRole;
  currentAssessorId: string;
  projects: Project[];
  evaluations: Evaluation[];
  onEvaluateProject: (project: Project) => void;
  onViewSummary: (project: Project) => void;
}

interface ProjectWithStatus extends Project {
  assessorRole?: AssessorRole;
  evaluationStatus: EvaluationStatus;
  averageScore?: number;
}

export function EvaluationDashboard({
  userRole,
  currentAssessorId,
  projects,
  evaluations,
  onEvaluateProject,
  onViewSummary,
}: EvaluationDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EvaluationStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | AssessorRole>('all');

  // Get projects with evaluation status
  const projectsWithStatus = useMemo((): ProjectWithStatus[] => {
    if (userRole === 'assessor') {
      // Assessor sees only their assigned projects
      return projects.map((project) => {
        const evaluation = evaluations.find(
          (e) => e.projectId === project.id && e.assessorId === currentAssessorId
        );
        return {
          ...project,
          assessorRole: evaluation?.assessorRole,
          evaluationStatus: evaluation?.status || 'Pending',
        };
      });
    } else {
      // Admin/Student sees all projects with average scores
      return projects.map((project) => {
        const projectEvaluations = evaluations.filter((e) => e.projectId === project.id);
        const submittedEvaluations = projectEvaluations.filter((e) => e.status === 'Submitted');
        const allSubmitted = projectEvaluations.length > 0 && submittedEvaluations.length === projectEvaluations.length;

        const averageScore =
          submittedEvaluations.length > 0
            ? submittedEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / submittedEvaluations.length
            : undefined;

        return {
          ...project,
          evaluationStatus: allSubmitted ? 'Submitted' : 'Pending',
          averageScore,
        };
      });
    }
  }, [userRole, currentAssessorId, projects, evaluations]);

  // Apply filters
  const filteredProjects = useMemo(() => {
    return projectsWithStatus.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.evaluationStatus === statusFilter;
      const matchesRole = roleFilter === 'all' || project.assessorRole === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [projectsWithStatus, searchTerm, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = projectsWithStatus.length;
    const pending = projectsWithStatus.filter((p) => p.evaluationStatus === 'Pending').length;
    const submitted = projectsWithStatus.filter((p) => p.evaluationStatus === 'Submitted').length;
    return { total, pending, submitted };
  }, [projectsWithStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-gray-900">
          {userRole === 'assessor' ? 'My Assigned Projects' : 'All Projects'}
        </h2>
        <p className="text-gray-600 mt-1">
          {userRole === 'assessor'
            ? 'Evaluate and score assigned academic projects'
            : 'View and manage project evaluations'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Evaluation</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-amber-600 text-xl">⏱</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Submitted</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.submitted}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project title or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>

            {userRole === 'assessor' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Co-Supervisor">Co-Supervisor</option>
                <option value="TA">TA</option>
                <option value="External Examiner">External</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[200px]">Project Title</th>
                <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[150px]">Student Name</th>
                {userRole === 'assessor' && (
                  <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[120px]">Role</th>
                )}
                <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[120px]">Department</th>
                {userRole !== 'assessor' && (
                  <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[100px]">Avg Score</th>
                )}
                <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[100px]">Status</th>
                <th className="px-6 py-3 text-right text-gray-700 text-sm min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No projects found matching your filters
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="text-gray-900 break-words">{project.title}</p>
                        <p className="text-gray-500 text-sm mt-1 break-all">{project.studentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 break-words min-w-0">{project.studentName}</td>
                    {userRole === 'assessor' && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 whitespace-nowrap">
                          {project.assessorRole}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-600 break-words min-w-0">{project.department}</td>
                    {userRole !== 'assessor' && (
                      <td className="px-6 py-4">
                        {project.averageScore !== undefined ? (
                          <span className="text-gray-900 whitespace-nowrap">{project.averageScore.toFixed(1)}/100</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap ${
                          project.evaluationStatus === 'Submitted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {project.evaluationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {userRole === 'assessor' ? (
                          <button
                            onClick={() => onEvaluateProject(project)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                          >
                            {project.evaluationStatus === 'Submitted' ? 'View Evaluation' : 'Evaluate'}
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewSummary(project)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                          >
                            <Eye className="w-4 h-4" />
                            View Summary
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
