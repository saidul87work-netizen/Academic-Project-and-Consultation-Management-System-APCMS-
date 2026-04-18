// AdminDashboard.tsx
// System-wide overview for admins: total users, projects, active positions,
// recent activity, and quick admin actions.

import { Users, BookOpen, Briefcase, Calendar, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { Project, Evaluation, PageView } from "../App";

interface AdminDashboardProps {
  projects: Project[];
  evaluations: Evaluation[];
  onNavigate: (page: PageView) => void;
  onViewProject: (id: string) => void;
}

// Mock system-level data an admin would see
const MOCK_STATS = {
  totalUsers: 48,
  totalFaculty: 12,
  totalStudents: 34,
  pendingApprovals: 5,
  roomsBooked: 7,
  openPositions: 6,
};

// Mock recent activity log
const RECENT_ACTIVITY = [
  { id: 1, text: "New project submitted by Ali Hassan", time: "2 min ago", type: "project" },
  { id: 2, text: "Fatima applied for RA position", time: "15 min ago", type: "position" },
  { id: 3, text: "Dr. Rahman submitted evaluation for Project #12", time: "1 hr ago", type: "eval" },
  { id: 4, text: "Lab 301 booked by Nadia for project work", time: "2 hr ago", type: "room" },
  { id: 5, text: "New user registered: Karim Uddin (Student)", time: "3 hr ago", type: "user" },
];

const activityColor: Record<string, string> = {
  project: "bg-blue-500",
  position: "bg-purple-500",
  eval: "bg-green-500",
  room: "bg-yellow-500",
  user: "bg-gray-400",
};

export function AdminDashboard({ projects, evaluations, onNavigate, onViewProject }: AdminDashboardProps) {
  const pendingEvals = evaluations.filter((e) => e.status === "Pending");
  const completedEvals = evaluations.filter((e) => e.status === "Submitted");

  const stats = [
    { label: "Total Users", value: MOCK_STATS.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Projects", value: projects.length || 10, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Open Positions", value: MOCK_STATS.openPositions, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Rooms Booked Today", value: MOCK_STATS.roomsBooked, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-500 p-6 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-8 text-slate-300" />
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="mt-1 text-slate-300">
              {MOCK_STATS.pendingApprovals} pending approval{MOCK_STATS.pendingApprovals !== 1 ? "s" : ""} · {pendingEvals.length} evaluations awaiting review
            </p>
          </div>
        </div>
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

      {/* User breakdown + Evaluation progress side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* User Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4" /> User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Students", count: MOCK_STATS.totalStudents, color: "bg-blue-500" },
              { label: "Faculty", count: MOCK_STATS.totalFaculty, color: "bg-emerald-500" },
              { label: "Admins", count: 2, color: "bg-slate-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground">{item.label}</span>
                <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.count / MOCK_STATS.totalUsers) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-6 text-right">{item.count}</span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onNavigate("users")}>
              Manage Users <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Evaluation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4" /> Evaluation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Submitted", count: completedEvals.length, color: "bg-green-500" },
              { label: "Pending", count: pendingEvals.length, color: "bg-yellow-400" },
            ].map((item) => {
              const total = evaluations.length || 1;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(item.count / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-6 text-right">{item.count}</span>
                </div>
              );
            })}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onNavigate("projects")}>
              View Projects <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            { label: "Manage Users", page: "users" as PageView },
            { label: "All Projects", page: "projects" as PageView },
            { label: "Room Bookings", page: "reservations" as PageView },
            { label: "Positions", page: "positions" as PageView },
          ].map((action) => (
            <Button key={action.label} variant="outline" onClick={() => onNavigate(action.page)}>
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-1.5 size-2 rounded-full shrink-0 ${activityColor[item.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")}>
              View all <ArrowRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex cursor-pointer items-center justify-between py-3 px-2 hover:bg-muted/40 rounded-md transition-colors"
                  onClick={() => onViewProject(project.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.studentName} · {project.department}</p>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
