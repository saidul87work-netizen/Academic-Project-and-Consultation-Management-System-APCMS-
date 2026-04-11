import { Search, Filter, Plus, UserPlus, UserCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { UserRole, Project, Evaluation } from '../App';
import { AddProjectModal } from './AddProjectModal';
import { EvaluationDashboard } from './EvaluationDashboard';
import { projectApi } from '../services/projectService';
import { toast } from 'sonner';

interface ProjectsListProps {
  userRole: UserRole;
  onViewProject: (projectId: string) => void;
  projects: Project[];
  evaluations: Evaluation[];
  onProjectCreated?: () => Promise<void> | void;
  onAssignEvaluation?: (project: Project) => void;
  studentName: string;
}

type TabKey = 'evaluations' | 'projects';

export function ProjectsList({
  userRole,
  onViewProject,
  projects,
  evaluations,
  onProjectCreated,
  onAssignEvaluation,
  studentName,
}: ProjectsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

// Tab state
  const [tab, setTab] = useState<TabKey>('evaluations');

  const departments = useMemo(() => {
    const depts = new Set(projects.map((p) => p.department));
    return Array.from(depts);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesDept = departmentFilter === 'all' || project.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [projects, searchTerm, statusFilter, departmentFilter]);

  // Handlers for EvaluationDashboard
  const handleEvaluateProject = (project: Project) => {
    onViewProject(project.id);
  };

  const handleViewSummary = (project: Project) => {
    // For now, just navigate to project details
    onViewProject(project.id);
  };

  const primaryColors = {
    student: '#dc2626',
    faculty: '#2563eb',
    admin: '#16a34a',
  } as const;

  const hoverColors = {
    student: '#b91c1c',
    faculty: '#1d4ed8',
    admin: '#15803d',
  } as const;

  const roleKey = (userRole as keyof typeof primaryColors) || 'student';
  const baseColor = primaryColors[roleKey] || '#dc2626';
  const hoverColor = hoverColors[roleKey] || '#b91c1c';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Project Management</h2>
          <p className="text-gray-600 mt-1">View projects and manage evaluations</p>
        </div>

        {/* ✅ Split into TWO buttons */}
        <div className="flex gap-2">
          {/* Button 1: Add New Project */}
          <button
            onClick={() => setShowAddModal(true)}
            disabled={false}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `3px solid ${baseColor}`,
              backgroundColor: baseColor,
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '160px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = hoverColor;
              e.currentTarget.style.borderColor = hoverColor;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = baseColor;
              e.currentTarget.style.borderColor = baseColor;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            }}
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>

          {/* Button 2: Switch Tab */}
          <button
            type="button"
            onClick={() => setTab(tab === 'evaluations' ? 'projects' : 'evaluations')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
            title="Switch between Evaluations and Projects"
          >
            {tab === 'evaluations' ? (
              <>
                <UserCheck className="w-4 h-4" />
                Go to Projects
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Go to Evaluations
              </>
            )}
          </button>
        </div>
      </div>

      {/* ✅ Tabs are now controlled by `tab` */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab((v === 'projects' ? 'projects' : 'evaluations') as TabKey)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-6">
          <EvaluationDashboard
            userRole={userRole}
            currentAssessorId="demo-faculty-1"
            projects={projects}
            evaluations={evaluations}
            onEvaluateProject={handleEvaluateProject}
            onViewSummary={handleViewSummary}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects or students..."
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
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => {
              const projectEvals = evaluations.filter((e) => e.projectId === project.id);
              const submittedEvals = projectEvals.filter((e) => e.status === 'Submitted');
              const avgScore =
                submittedEvals.length > 0
                  ? submittedEvals.reduce((sum, e) => sum + e.totalScore, 0) / submittedEvals.length
                  : null;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6 cursor-pointer" onClick={() => onViewProject(project.id)}>
                    <div className="flex items-start justify-between mb-4 min-w-0">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="text-gray-900 mb-2 break-words">{project.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      </div>
                      <span
                        className={`ml-3 px-3 py-1 rounded-full text-xs flex-shrink-0 ${
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

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Student</p>
                        <p className="text-sm text-gray-900 mt-1">{project.studentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Department</p>
                        <p className="text-sm text-gray-900 mt-1">{project.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Supervisor</p>
                        <p className="text-sm text-gray-900 mt-1">{project.supervisor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Timeline</p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(project.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-600">
                            Evaluations: {submittedEvals.length}/{projectEvals.length}
                          </div>
                        </div>
                        {avgScore !== null ? (
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Average Score</p>
                            <p className="text-gray-900">{avgScore.toFixed(1)}/100</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Pending evaluation</span>
                        )}
                      </div>

                      {/* Faculty Actions */}
                      {userRole === 'faculty' && (
                        <div className="flex justify-center gap-2 mt-3">
                          <>
                            {(() => {
                              // CONDITION 1: Show "Evaluate Project" ONLY if I am the supervisor and project hasn't been evaluated
                              const amISupervisor = project.supervisor === 'demo-faculty-1';

                              if (amISupervisor && submittedEvals.length === 0) {
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Assigning myself to evaluate project:', project.id);
                                      if (onAssignEvaluation) {
                                        onAssignEvaluation(project);
                                      } else {
                                        toast.error('Assignment function not available');
                                      }
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-200 text-base font-bold shadow-lg hover:shadow-xl border-2 border-blue-400 hover:border-blue-500 transform hover:scale-105"
                                    title="Assign yourself to evaluate this project"
                                  >
                                    🎯 Evaluate Project
                                  </button>
                                );
                              }

                              // CONDITION 2: Show "Make Me Supervisor" ONLY if the project has NO supervisor
                              if (!project.supervisor) {
                                return (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!window.confirm('Are you sure you want to supervise this project?')) return;

                                      console.log('Assigning self as supervisor for project:', project.id);
                                      try {
                                        await projectApi.setMeAsSupervisor(project.id);
                                        toast.success('Successfully assigned as supervisor!');
                                        // Refresh the projects list
                                        if (onProjectCreated) {
                                          await onProjectCreated();
                                        }
                                      } catch (error: any) {
                                        console.error('Failed to assign as supervisor:', error);
                                        toast.error(
                                          error.response?.data?.error || 'Failed to assign as supervisor'
                                        );
                                      }
                                    }}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                    Make Me Supervisor
                                  </button>
                                );
                              }

                              // Return nothing if I am not the supervisor AND someone else is already supervising
                              return null;
                            })()}
                          </>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No projects found matching your filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Project Modal - For all roles */}
      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            try {
              if (onProjectCreated) {
                await onProjectCreated();
              }
            } catch (error) {
              console.error('Error refreshing projects after creation:', error);
              toast.error('Project created but failed to refresh list. Please refresh the page.');
            }
          }}
          studentName={studentName}
          userRole={userRole}
        />
      )}
    </div>
  );
}
