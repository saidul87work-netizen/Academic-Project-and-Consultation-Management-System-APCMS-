// SupervisorManagement.tsx
// Admin-only view. Lists all projects and lets the admin assign or
// reassign a supervisor to each project from a dropdown of faculty members.

import { useState } from "react";
import { Search, UserCheck, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import type { Project } from "../App";

interface SupervisorManagementProps {
  projects: Project[];
  onProjectsUpdated: () => void;
}

// Mock faculty list — replace with a real API call when backend is ready
const FACULTY_LIST = [
  { id: "fac-1", name: "Dr. Rahman" },
  { id: "fac-2", name: "Dr. Hossain" },
  { id: "fac-3", name: "Prof. Ahmed" },
  { id: "fac-4", name: "Dr. Karim" },
  { id: "fac-5", name: "Prof. Islam" },
];

export function SupervisorManagement({ projects, onProjectsUpdated }: SupervisorManagementProps) {
  const [search, setSearch] = useState("");
  // Map of projectId -> selected faculty name (pending save)
  const [pending, setPending] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (projectId: string, facultyName: string) => {
    setPending((prev) => ({ ...prev, [projectId]: facultyName }));
    setOpenDropdown(null);
  };

  const handleAssign = async (project: Project) => {
    const selected = pending[project.id];
    if (!selected) {
      toast.error("Please select a faculty member first.");
      return;
    }
    setSaving(project.id);
    try {
      // TODO: replace with real API call e.g. projectApi.assignSupervisor(project.id, selectedFacultyId)
      await new Promise((r) => setTimeout(r, 600)); // simulate network delay
      toast.success(`Supervisor "${selected}" assigned to "${project.title}"`);
      setPending((prev) => {
        const updated = { ...prev };
        delete updated[project.id];
        return updated;
      });
      onProjectsUpdated();
    } catch {
      toast.error("Failed to assign supervisor. Try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Supervisor Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Assign faculty supervisors to student projects.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by project title, student, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filtered.length} project{filtered.length !== 1 ? "s" : ""} shown</span>
        <span>·</span>
        <span>{filtered.filter((p) => !p.supervisor).length} without supervisor</span>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No projects match your search.
            </CardContent>
          </Card>
        ) : (
          filtered.map((project) => {
            const currentSupervisor = project.supervisor || "Not assigned";
            const selectedFaculty = pending[project.id];
            const isDropdownOpen = openDropdown === project.id;

            return (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{project.title}</p>
                        <Badge variant="outline" className="text-xs shrink-0">{project.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Student: {project.studentName} · Dept: {project.department}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <UserCheck className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Current:{" "}
                          <span className={project.supervisor ? "text-foreground font-medium" : "text-red-500"}>
                            {currentSupervisor}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Assign Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Custom dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-background hover:bg-muted transition-colors min-w-[160px] justify-between"
                          onClick={() => setOpenDropdown(isDropdownOpen ? null : project.id)}
                        >
                          <span className="truncate">
                            {selectedFaculty || "Select faculty…"}
                          </span>
                          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg">
                            {FACULTY_LIST.map((fac) => (
                              <button
                                key={fac.id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                                onClick={() => handleSelect(project.id, fac.name)}
                              >
                                {fac.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        disabled={!selectedFaculty || saving === project.id}
                        onClick={() => handleAssign(project)}
                      >
                        {saving === project.id ? "Saving…" : "Assign"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
