// StudentDashboard.tsx
// Shows a student's personal stats: their projects, pending evaluations,
// open positions to apply for, and quick action buttons.

import { BookOpen, Briefcase, Calendar, ClipboardList, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { Project, Evaluation, PageView } from "../App";

interface StudentDashboardProps {
  projects: Project[];
  evaluations: Evaluation[];
  onNavigate: (page: PageView) => void;
  onViewProject: (id: string) => void;
}

export function StudentDashboard({ projects, evaluations, onNavigate, onViewProject }: StudentDashboardProps) {
  const myProjects = projects;
  const pendingEvals = evaluations.filter((e) => e.status === "Pending");
  const submittedEvals = evaluations.filter((e) => e.status === "Submitted");

  const stats = [
    {
      label: "My Projects",
      value: myProjects.length,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Reviews",
      value: pendingEvals.length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Completed Reviews",
      value: submittedEvals.length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Open Positions",
      value: 3,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const quickActions = [
    { label: "View My Projects", page: "projects" as PageView, icon: BookOpen },
    { label: "Apply for Position", page: "positions" as PageView, icon: Briefcase },
    { label: "Book a Room", page: "reservations" as PageView, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
        <h2 className="text-2xl font-bold text-foreground">Welcome back, Student!</h2>
        <p className="mt-1 text-foreground">
          You have {pendingEvals.length} pending evaluation{pendingEvals.length !== 1 ? "s" : ""} and {myProjects.length} active project{myProjects.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onNavigate(action.page)}
            >
              <action.icon className="size-4" />
              {action.label}
              <ArrowRight className="size-3" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* My Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")}>
            View all <ArrowRight className="ml-1 size-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {myProjects.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-2 size-8 opacity-40" />
              <p className="text-sm">No projects yet. Ask your supervisor to create one.</p>
            </div>
          ) : (
            <div className="divide-y">
              {myProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex cursor-pointer items-center justify-between py-3 hover:bg-muted/40 px-2 rounded-md transition-colors"
                  onClick={() => onViewProject(project.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Supervisor: {project.supervisor || "Not assigned"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      project.status === "Completed"
                        ? "default"
                        : project.status === "In Progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
