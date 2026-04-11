import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ProjectsList } from "./components/ProjectsList";
import { ProjectDetails } from "./components/ProjectDetails";
import { DeskReservation } from "./components/DeskReservation";
import { LabAvailability } from "./components/LabAvailability";
import { MeetingRoomReservation } from "./components/MeetingRoomReservation";
import { Reservation } from "./components/Reservation";
import { MyReservations } from "./components/MyReservations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { projectApi } from "./services/projectService";
import { evaluationApi } from "./services/evaluationApi";
import { applicationApi } from "./services/positionApi";
import { PositionApplications } from "./components/PositionApplications";
import { BookOpen, Briefcase, Building, Calendar, MonitorSmartphone, Users, LogOut } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle";

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
  startDate: string;
  endDate: string;
  supervisor: string;
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

export type PageView = "dashboard" | "projects" | "project-details" | "reservations" | "positions" | "users";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("userRole");
    return (savedRole as UserRole) || "student";
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      type: "desk",
      resourceName: "Desk A-12",
      date: "2025-12-25",
      startTime: "09:00",
      endTime: "11:00",
      userName: "Rafsan Rahman",
      userType: "student",
      purpose: "Study session"
    },
    {
      id: "2",
      type: "lab",
      resourceName: "Lab 301 - PC 5",
      date: "2025-12-26",
      startTime: "14:00",
      endTime: "16:00",
      userName: "Rafsan Rahman",
      userType: "student",
      purpose: "Project work"
    },
    {
      id: "3",
      type: "meeting-room",
      resourceName: "Meeting Room B-05",
      date: "2025-12-27",
      startTime: "10:00",
      endTime: "12:00",
      userName: "Dr. Smith",
      userType: "faculty",
      purpose: "Thesis defense prep"
    }
  ]);

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    setSelectedProjectId(null); // Reset selected project when navigating
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage("project-details");
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
        status: p.status === 'SUBMITTED' ? 'Planning' : p.status === 'IN_REVIEW' ? 'In Progress' : p.status === 'EVALUATED' ? 'Completed' : 'Planning',
        startDate: p.startDate,
        endDate: p.expectedEndDate,
        supervisor: p.supervisorName,
      }));
      setProjects(mappedProjects);
    } catch (error: any) {
      console.error('Error loading projects:', error);
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

  const addReservation = (reservation: Omit<Reservation, "id">) => {
    const newReservation = { ...reservation, id: `res-${Date.now()}` };
    setReservations((prev) => [...prev, newReservation]);
    toast.success("Reservation added successfully!");
  };

  const cancelReservation = (id: string) => {
    setReservations((prev) => prev.filter((res) => res.id !== id));
    toast.info("Reservation cancelled.");
  };

  const renderReservations = () => {
    return (
      <Tabs defaultValue="reservation" className="space-y-6">
        <TabsList className="flex w-full gap-2 overflow-x-auto rounded-full bg-muted p-1">
          <TabsTrigger value="desks" className="flex items-center gap-2 px-3 py-2 text-sm font-medium shrink-0">
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">Desks</span>
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center gap-2 px-3 py-2 text-sm font-medium shrink-0">
            <MonitorSmartphone className="size-4" />
            <span className="hidden sm:inline">Labs</span>
          </TabsTrigger>
          <TabsTrigger value="meeting-rooms" className="flex items-center gap-2 px-3 py-2 text-sm font-medium shrink-0">
            <Users className="size-4" />
            <span className="hidden sm:inline">Meeting Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="reservation" className="flex items-center gap-2 px-3 py-2 text-sm font-medium shrink-0">
            <Building className="size-4" />
            <span className="hidden sm:inline">Reservation</span>
          </TabsTrigger>
          <TabsTrigger value="my-reservations" className="flex items-center gap-2 px-3 py-2 text-sm font-medium shrink-0">
            <Calendar className="size-4" />
            <span className="hidden sm:inline">My Bookings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desks" className="space-y-6">
          <DeskReservation
            reservations={reservations.filter(r => r.type === "desk")}
            onReserve={addReservation}
          />
        </TabsContent>

        <TabsContent value="labs" className="space-y-6">
          <LabAvailability
            reservations={reservations.filter(r => r.type === "lab")}
            onReserve={addReservation}
          />
        </TabsContent>

        <TabsContent value="meeting-rooms" className="space-y-6">
          <MeetingRoomReservation
            reservations={reservations.filter(r => r.type === "meeting-room")}
            onReserve={addReservation}
          />
        </TabsContent>

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
    refreshMyProjects();
    loadEvaluations();
  }, [userRole]);

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
                      {userRole === "admin" ? "AD" : userRole === "faculty" ? "FA" : "ST"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {userRole === "admin" ? "Admin" : userRole === "faculty" ? "Faculty" : "Student"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{userRole}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <ModeToggle />
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                  {(['student', 'faculty', 'admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        userRole === role
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 w-full max-w-full">
          {currentPage === "dashboard" && (
            <Dashboard
              userRole={userRole}
              onNavigate={handleNavigate}
              onViewProject={handleViewProject}
              projects={projects}
              evaluations={evaluations}
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
            />
          )}
          {currentPage === "project-details" && selectedProjectId && (
            <ProjectDetails
              projectId={selectedProjectId}
              userRole={userRole}
              currentUserId="demo-faculty-user"
              onBack={handleBackToProjects}
              projects={projects}
              evaluations={evaluations}
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
          {currentPage === "positions" && (
            <PositionApplications
              userRole={userRole}
              studentId="demo-student-1"
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
