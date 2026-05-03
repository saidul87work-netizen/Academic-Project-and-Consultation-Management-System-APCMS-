import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { StudentDashboard } from "./components/StudentDashboard";
import { FacultyDashboard } from "./components/FacultyDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { SupervisorManagement } from "./components/SupervisorManagement";
import { SupervisorAvailability } from "./components/SupervisorAvailability";
import { ProjectsList } from "./components/ProjectsList";
import { ProjectDetails } from "./components/ProjectDetails";
import { EvaluationSummaryPage } from "./components/EvaluationSummaryPage";
import { DeskReservation } from "./components/DeskReservation";
import { LabAvailability } from "./components/LabAvailability";
import { MeetingRoomReservation } from "./components/MeetingRoomReservation";
import { Reservation } from "./components/Reservation";
import { MyReservations } from "./components/MyReservations";
import { UserManagement } from "./components/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { projectApi } from "./services/projectService";
import { evaluationApi } from "./services/evaluationApi";
import { applicationApi } from "./services/positionApi";
import { reservationApi } from "./services/reservationApi";
import { PositionApplications } from "./components/PositionApplications";
import { BookOpen, Briefcase, Building, Calendar, MonitorSmartphone, Users, LogOut } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle";
import { Login } from "./components/Login";

export type UserRole = "admin" | "faculty" | "student";
export type AssessorRole = "Supervisor" | "Co-Supervisor" | "ST" | "RA" | "TA" | "External Examiner";
export type EvaluationStatus = "Pending" | "Submitted";

export interface Project {
  id: string;
  title: string;
  studentName: string;
  studentId: string;
  description: string;
  department: string;
  status: string;
  supervisor: string;
  stage: string;
  startDate?: string;
  endDate?: string;
}

export interface Criterion {
  name: string;
  maxScore: number;
  score?: number;
  comment: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  assessorId: string;
  assessorName: string;
  assessorRole: string;
  criteria: Criterion[];
  finalComment: string;
  totalScore: number;
  status: 'Pending' | 'Submitted';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  type: "desk" | "lab" | "meeting-room";
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  userType: UserRole;
  purpose: string;
}

export type PageView = "dashboard" | "projects" | "project-details" | "reservations" | "positions" | "users" | "supervisor-management" | "supervisor-availability" | "evaluation-summary";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("token"));
  const [currentPage, setCurrentPage] = useState<PageView>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("userRole");
    return (savedRole as UserRole) || "student";
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("userName") || "");

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    setSelectedProjectId(null); // Reset selected project when navigating
  };

  const handleViewProject = (projectId: string) => {
    console.log('🔍 App: Viewing project details for ID:', projectId);
    setSelectedProjectId(projectId);
    setCurrentPage("project-details");
  };

  const handleViewSummary = (projectId: string) => {
    console.log('📊 App: Viewing evaluation summary for ID:', projectId);
    setSelectedProjectId(projectId);
    setCurrentPage("evaluation-summary");
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setCurrentPage("projects");
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    localStorage.setItem("userRole", newRole);
  };

  const refreshMyProjects = async () => {
    try {
      let response;
      if (userRole === 'student') {
        response = await projectApi.listMyProjects();
      } else {
        response = await projectApi.listAllProjects();
      }

      const mappedProjects: Project[] = response.map((p: any) => ({
        id: p._id,
        title: p.title,
        studentName: p.studentName || (p.student?.name) || 'Unknown Student',
        studentId: p.studentId,
        description: p.description,
        department: p.department,
        status: 
          p.status === 'submitted' || p.status === 'SUBMITTED' ? 'Submitted' : 
          p.status === 'approved' || p.status === 'APPROVED' ? 'In Progress' : 
          p.status === 'completed' || p.status === 'COMPLETED' ? 'Completed' : 'Planning',
        startDate: p.startDate,
        endDate: p.expectedEndDate,
        supervisor: p.supervisorName || 'TBD',
        stage: p.stage || 'Proposal',
      }));
      console.log(`✅ App: Successfully refreshed ${mappedProjects.length} projects`);
      setProjects(mappedProjects);
    } catch (error: any) {
      console.error('❌ App: Error loading projects:', error);
      toast.error('Failed to load projects from MongoDB');
    }
  };

  const loadEvaluations = async () => {
    try {
      console.log('📥 Loading evaluations from MongoDB');
      const evaluationsData = await evaluationApi.list();
      const mappedEvaluations: Evaluation[] = evaluationsData.map((e: any) => ({
        id: e._id,
        projectId: e.projectId,
        assessorId: e.assessorId,
        assessorName: e.assessorName,
        assessorRole: e.assessorRole,
        criteria: e.criteria,
        finalComment: e.finalComment,
        totalScore: e.totalScore,
        status: e.status,
        submittedAt: e.submittedAt,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }));
      setEvaluations(mappedEvaluations);
      console.log('✅ Loaded evaluations:', mappedEvaluations.length);
    } catch (error: any) {
      console.error('Error loading evaluations:', error);
      toast.error('Failed to load evaluations');
    }
  };

  const loadReservations = async () => {
    try {
      const data = await reservationApi.list();
      const mappedReservations: Reservation[] = data.map((r: any) => ({
        id: r._id,
        type: r.type,
        resourceName: r.resourceName,
        date: new Date(r.date).toISOString().split('T')[0],
        startTime: r.startTime,
        endTime: r.endTime,
        userName: r.userName,
        userType: 'student', // Default or derived if needed
        purpose: r.purpose,
      }));
      setReservations(mappedReservations);
    } catch (error: any) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleAssignEvaluation = async (project: Project) => {
    try {
      console.log('🎯 Assigning evaluation for project:', project.title);

      const evaluationData = {
        projectId: project.id,
        assessorRole: 'Supervisor',
        assessorId: 'demo-faculty-1',
        assessorName: 'Demo Faculty'
      };

      // Create evaluation in MongoDB
      const newEvaluation = await evaluationApi.create(evaluationData);

      // Map backend response to frontend Evaluation type
      const evaluation: Evaluation = {
        id: newEvaluation._id,
        projectId: project.id,
        assessorId: newEvaluation.assessorId,
        assessorName: newEvaluation.assessorName,
        assessorRole: newEvaluation.assessorRole as AssessorRole,
        criteria: newEvaluation.criteria,
        finalComment: newEvaluation.finalComment,
        totalScore: newEvaluation.totalScore,
        status: newEvaluation.status,
        submittedAt: newEvaluation.submittedAt || undefined,
        createdAt: newEvaluation.createdAt,
        updatedAt: newEvaluation.updatedAt,
      };

      // Update local state immediately for responsive UI
      setEvaluations(prev => [...prev, evaluation]);

      // Refresh evaluations from server to ensure consistency
      await loadEvaluations();

      toast.success(`Successfully assigned to evaluate "${project.title}"`);
      console.log('✅ Evaluation assignment persisted to MongoDB');
    } catch (error: any) {
      console.error('Error assigning evaluation:', error);
      toast.error(error.response?.data?.error || 'Failed to assign evaluation');
    }
  };

  const addReservation = async (reservation: Omit<Reservation, "id">) => {
    try {
      const newRes = await reservationApi.create({
        type: reservation.type,
        resourceName: reservation.resourceName,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        purpose: reservation.purpose || 'Booking',
      });
      setReservations((prev) => [...prev, { ...reservation, id: newRes._id }]);
      toast.success("Reservation added successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add reservation");
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      await reservationApi.cancel(id);
      setReservations((prev) => prev.filter((res) => res.id !== id));
      toast.info("Reservation cancelled.");
    } catch (error: any) {
      toast.error("Failed to cancel reservation");
    }
  };

  const renderReservations = () => {
    return (
      <Tabs defaultValue="reservation" className="space-y-6">
        <TabsList className="flex w-full gap-2 overflow-x-auto rounded-full bg-muted p-1">
          <TabsTrigger value="reservation" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium">
            <Building className="size-4" />
            <span>Workspace Booking</span>
          </TabsTrigger>
          <TabsTrigger value="my-reservations" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium">
            <Calendar className="size-4" />
            <span>My Bookings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservation" className="space-y-6">
          <Reservation
            reservations={reservations}
            onReserve={addReservation}
          />
        </TabsContent>

        <TabsContent value="my-reservations" className="space-y-6">
          <MyReservations
            reservations={reservations}
            onCancel={cancelReservation}
          />
        </TabsContent>
      </Tabs>
    );
  };

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshMyProjects();
      loadEvaluations();
      loadReservations();
    }
  }, [userRole, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserRole("student");
    setUserName("");
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={(user) => {
          setIsAuthenticated(true);
          handleRoleChange(user.role as UserRole);
          if (user.id) localStorage.setItem('userId', user.id);
          if (user.name) {
            localStorage.setItem('userName', user.name);
            setUserName(user.name);
          }
        }} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} userRole={userRole} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-gray-900">Campus Management System</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Academic Project Management
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">
                      {(userName || userRole || 'U').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {userName || (userRole === "admin" ? "Admin" : userRole === "faculty" ? "Faculty" : "Student")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{userRole}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 w-full max-w-full">
          {currentPage === "dashboard" && userRole === "student" && (
            <StudentDashboard
              projects={projects}
              evaluations={evaluations}
              onNavigate={handleNavigate}
              onViewProject={handleViewProject}
            />
          )}
          {currentPage === "dashboard" && userRole === "faculty" && (
            <FacultyDashboard
              projects={projects}
              evaluations={evaluations}
              onNavigate={handleNavigate}
              onViewProject={handleViewProject}
            />
          )}
          {currentPage === "dashboard" && userRole === "admin" && (
            <AdminDashboard
              projects={projects}
              evaluations={evaluations}
              onNavigate={handleNavigate}
              onViewProject={handleViewProject}
            />
          )}
          {currentPage === "projects" && (
            <ProjectsList
              userRole={userRole}
              onViewProject={handleViewProject}
              projects={projects}
              evaluations={evaluations}
              onProjectCreated={refreshMyProjects}
              onAssignEvaluation={handleAssignEvaluation}
              studentName="Your name will be auto-saved"
              currentUserId={localStorage.getItem('userId') || ''}
              onViewSummary={handleViewSummary}
              onStatusUpdate={refreshMyProjects}
            />
          )}
          {currentPage === "project-details" && selectedProjectId && (
            <ProjectDetails
              projectId={selectedProjectId}
              userRole={userRole}
              currentUserId={localStorage.getItem('userId') || ''}
              onBack={handleBackToProjects}
              projects={projects}
              evaluations={evaluations}
              onStatusUpdate={refreshMyProjects}
              onSubmitEvaluation={(evaluation) => {
                setEvaluations(prev => prev.map(e => e.id === evaluation.id ? evaluation : e));
                toast.success('Evaluation submitted successfully!');
              }}
              onAssignEvaluation={async (projectId, facultyName, facultyId) => {
                const project = projects.find(p => p.id === projectId);
                if (project) {
                  await handleAssignEvaluation(project);
                }
              }}
            />
          )}
          {currentPage === "reservations" && renderReservations()}
          {currentPage === "users" && <UserManagement />}
          {currentPage === "supervisor-management" && (
            <SupervisorManagement
              projects={projects}
              onProjectsUpdated={refreshMyProjects}
            />
          )}
          {currentPage === "supervisor-availability" && <SupervisorAvailability />}
          {currentPage === "evaluation-summary" && selectedProjectId && (
            <EvaluationSummaryPage
              project={projects.find(p => p.id === selectedProjectId)!}
              userRole={userRole}
              evaluations={evaluations}
              onBack={handleBackToProjects}
            />
          )}
          {currentPage === "positions" && (
            <PositionApplications
              userRole={userRole}
              studentId={localStorage.getItem('userId') || ''}
              onUpdateApplication={async (id: string, status: "accepted" | "rejected", reason?: string) => {
                try {
                  await applicationApi.updateApplicationStatus(id, status);
                  toast.success(`Application ${status} successfully!`);
                } catch (error: any) {
                  console.error("Failed to update application:", error);
                  toast.error(`Failed to ${status} application: ${error.message || "Unknown error"}`);
                }
              }}
            />
          )}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
