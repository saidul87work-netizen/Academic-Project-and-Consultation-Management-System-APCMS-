import { useState, useMemo } from 'react';
import { Search, Filter, Eye, FileEdit } from 'lucide-react';
import type { Project, UserRole, AssessorRole, EvaluationStatus, Evaluation } from '../App';
import { evaluationApi } from '../services/evaluationApi';
import axios from 'axios';
import { toast } from 'sonner';

interface EvaluationDashboardProps {
  userRole: UserRole;
  currentAssessorId: string;
  projects: Project[];
  evaluations: Evaluation[];
  onEvaluateProject: (project: Project) => void;
  onViewSummary: (project: Project) => void;
  onStatusUpdate?: () => void;
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
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'Planning' | 'Submitted'>('all');

  // Get projects with evaluation status
  const projectsWithStatus = useMemo((): ProjectWithStatus[] => {
    if (userRole === 'faculty') {
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
      const matchesProjectStatus =
        projectStatusFilter === 'all' ||
        (project.status || '').toLowerCase() === projectStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesRole && matchesProjectStatus;
    });
  }, [projectsWithStatus, searchTerm, statusFilter, roleFilter, projectStatusFilter]);

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
          {userRole === 'faculty' ? 'My Assigned Projects' : 'All Projects'}
        </h2>
        <p className="text-gray-600 mt-1">
          {userRole === 'faculty'
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
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
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

          {/* Project Status Filter Pills */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            {(['all', 'Planning', 'Submitted'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setProjectStatusFilter(opt)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderColor:
                    projectStatusFilter === opt
                      ? opt === 'all' ? '#2563eb'
                        : opt === 'Planning' ? '#d97706'
                        : '#16a34a'
                      : '#e5e7eb',
                  background:
                    projectStatusFilter === opt
                      ? opt === 'all' ? '#dbeafe'
                        : opt === 'Planning' ? '#fef3c7'
                        : '#dcfce7'
                      : '#fff',
                  color:
                    projectStatusFilter === opt
                      ? opt === 'all' ? '#1d4ed8'
                        : opt === 'Planning' ? '#b45309'
                        : '#15803d'
                      : '#6b7280',
                }}
              >
                {opt === 'all' ? 'All' : opt}
              </button>
            ))}
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
                <th className="px-6 py-3 text-left text-gray-700 text-sm min-w-[120px]">Department</th>
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
                  <tr 
                    key={project.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onEvaluateProject(project)}
                  >
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="text-gray-900 font-medium break-words">{project.title}</p>
                        <p className="text-gray-400 text-xs mt-1 break-all uppercase tracking-tighter">ID: {project.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 break-words min-w-0 font-medium">{project.studentName}</td>
                    <td className="px-6 py-4 text-gray-600 break-words min-w-0">{project.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {/* Project Overall Status */}
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs whitespace-nowrap font-bold w-fit ${
                            project.status === 'Submitted'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : project.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {userRole === 'faculty' ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onViewSummary(project); }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold whitespace-nowrap border border-blue-200"
                            >
                              <Eye className="w-4 h-4" />
                              View Summary
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onViewSummary(project); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold whitespace-nowrap"
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
