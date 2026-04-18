// FacultyDashboard.tsx
// Shows a faculty member's workload: projects supervised, evaluations
// pending, and a shortcut to manage supervisor availability.

import { BookOpen, ClipboardCheck, Clock, Users, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { Project, Evaluation, PageView } from "../App";

interface FacultyDashboardProps {
  projects: Project[];
  evaluations: Evaluation[];
  onNavigate: (page: PageView) => void;
  onViewProject: (id: string) => void;
}

export function FacultyDashboard({ projects, evaluations, onNavigate, onViewProject }: FacultyDashboardProps) {
  const pendingEvals = evaluations.filter((e) => e.status === "Pending");
  const submittedEvals = evaluations.filter((e) => e.status === "Submitted");

  // Average score from submitted evaluations
  const avgScore =
    submittedEvals.length > 0
      ? Math.round(submittedEvals.reduce((sum, e) => sum + (e.totalScore || 0), 0) / submittedEvals.length)
      : 0;

  const stats = [
    {
      label: "Projects Supervised",
      value: projects.length,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Evaluations",
      value: pendingEvals.length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Submitted Evaluations",
      value: submittedEvals.length,
      icon: ClipboardCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avg. Score",
      value: avgScore > 0 ? avgScore : "—",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome, Faculty!</h2>
        <p className="mt-1 text-emerald-100">
          {pendingEvals.length > 0
            ? `You have ${pendingEvals.length} evaluation${pendingEvals.length !== 1 ? "s" : ""} waiting for your review.`
            : "All your evaluations are up to date. Great work!"}
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

      {/* Pending Evaluations Alert */}
      {pendingEvals.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="size-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-semibold">{pendingEvals.length} evaluation{pendingEvals.length !== 1 ? "s" : ""}</span> need your attention. Head to Projects to submit them.
            </p>
            <Button size="sm" variant="outline" className="ml-auto shrink-0" onClick={() => onNavigate("projects")}>
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("projects")}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-blue-50 p-3">
              <BookOpen className="size-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Manage Projects</p>
              <p className="text-xs text-muted-foreground">View and evaluate supervised projects</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("reservations")}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-purple-50 p-3">
              <Users className="size-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Book Meeting Room</p>
              <p className="text-xs text-muted-foreground">Reserve a room for project meetings</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Projects You Supervise</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")}>
            View all <ArrowRight className="ml-1 size-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No projects assigned yet.</p>
          ) : (
            <div className="divide-y">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex cursor-pointer items-center justify-between py-3 px-2 hover:bg-muted/40 rounded-md transition-colors"
                  onClick={() => onViewProject(project.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">Student: {project.studentName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {evaluations.some((e) => e.projectId === project.id && e.status === "Pending") && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                        Review needed
                      </Badge>
                    )}
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
