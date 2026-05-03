import { useState } from "react";
import { Search, UserCheck, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { projectApi } from "../services/projectService";
import { AddProjectModal } from "./AddProjectModal";
import type { Project } from "../App";

interface SupervisorManagementProps {
  projects: Project[];
  onProjectsUpdated: () => void;
}

export function SupervisorManagement({ projects, onProjectsUpdated }: SupervisorManagementProps) {
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (projectId: string) => {
    if (!projectId) {
      alert("Error: Project ID is missing.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      console.log('🗑️ Client: Attempting to delete project:', projectId);
      await projectApi.deleteProject(projectId);
      alert("Project deleted successfully!");
      toast.success("Project deleted successfully");
      await onProjectsUpdated();
    } catch (error: any) {
      console.error('❌ Client: Delete failed:', error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to delete project";
      alert(`Delete failed: ${errorMsg}`);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Assign supervisors and manage all student projects.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <Input
            className="pl-9 bg-gray-950/50 border-gray-700 text-white rounded-lg focus:ring-emerald-500"
            placeholder="Search by title, student, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">{filtered.length} Projects</span>
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full">{filtered.filter((p) => !p.supervisor).length} Unassigned</span>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-400">No projects match your search criteria.</p>
          </div>
        ) : (
          filtered.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Left: Project Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-bold text-lg text-white">{project.title}</h3>
                      <Badge className={
                        project.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 font-medium">Student</span>
                        <span className="text-gray-200">{project.studentName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 font-medium">Department</span>
                        <span className="text-gray-200">{project.department}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 font-medium">Stage</span>
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 w-fit">
                          {project.stage}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 col-span-full">
                        <span className="text-gray-500 font-medium">Supervisor</span>
                        <span className={project.supervisor ? "text-emerald-400" : "text-rose-400 font-medium italic"}>
                          {project.supervisor || "Pending Assignment"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="border-t sm:border-t-0 sm:border-l border-gray-800 p-6 flex flex-row sm:flex-col justify-center gap-3 bg-black/20">
                    <Button
                      variant="outline"
                      className={`flex-1 sm:w-32 min-w-fit justify-center gap-2 transition-all active:scale-95 border-2 ${
                        project.status === 'Submitted' 
                          ? 'bg-amber-600/20 border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white' 
                          : 'bg-blue-600/20 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
                      }`}
                      onClick={async () => {
                        const newStatus = project.status === 'Submitted' ? 'draft' : 'submitted';
                        console.log('🔄 Admin: Toggling status for project:', project.id, 'to:', newStatus);
                        try {
                          const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
                          const userId = localStorage.getItem('userId');
                          const userRole = localStorage.getItem('userRole');
                          
                          await projectApi.updateProject(project.id, { status: newStatus });
                          
                          toast.success(`Project marked as ${newStatus === 'submitted' ? 'SUBMITTED' : 'PENDING'}`);
                          onProjectsUpdated();
                        } catch (error: any) {
                          console.error('❌ Admin: Toggle failed:', error);
                          toast.error(error.response?.data?.error || "Failed to update status");
                        }
                      }}
                    >
                      {project.status === 'Submitted' ? 'Mark Pending' : 'Mark Submitted'}
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 sm:w-32 min-w-fit justify-center gap-2 bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit className="size-4" />
                      Modify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <AddProjectModal
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            onProjectsUpdated();
            setEditingProject(null);
          }}
          studentName="Admin"
          userRole="admin"
          project={editingProject}
        />
      )}
    </div>
  );
}

