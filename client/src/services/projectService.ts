import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Demo mode - set headers for project operations
api.interceptors.request.use((config: any) => {
  // Set demo headers for authentication
  config.headers['x-user-id'] = 'demo-faculty-1'; // Default demo faculty ID
  config.headers['x-user-role'] = 'faculty'; // Default role
  console.log('PROJECT API REQUEST - Using demo headers for authentication');
  return config;
});

export interface ProjectEvaluation {
  evaluatedBy: string;
  marks: number;
  remarks: string;
  evaluatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  members: string[];
  supervisor: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  evaluation?: ProjectEvaluation;
  // Legacy fields for backward compatibility
  student?: string;
  studentName?: string;
  studentId?: string;
  department?: string;
  supervisorName?: string;
  startDate?: string;
  expectedEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  studentId?: string | null;
  title: string;
  description: string;
  department?: string;
  supervisorName?: string;
  startDate?: string;
  expectedEndDate?: string;
  creatorName?: string;
  userRole?: string;
  assignSelfAsSupervisor?: boolean;
}

export interface ProjectEvaluationData {
  marks: number;
  remarks: string;
  status?: string;
}

export const projectApi = {
  // Test API connection
  testConnection: async () => {
    console.log('🧪 FRONTEND: Testing API connection');
    try {
      const response = await api.get('/projects/test');
      console.log('✅ FRONTEND: API test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ FRONTEND: API test failed:', error);
      throw error;
    }
  },

  // Create new project - stores in MongoDB
  createProject: async (projectData: CreateProjectData): Promise<Project> => {
    console.log('🚀 FRONTEND: Sending project to MongoDB:', projectData);
    const response = await api.post('/projects', projectData);
    console.log('✅ FRONTEND: Project creation response:', response.data);

    // Handle both response formats (direct object or wrapped in success/data)
    if (response.data.project) {
      return response.data.project;
    }
    return response.data;
  },

  // Get projects for logged-in student
  listMyProjects: async (): Promise<Project[]> => {
    console.log('📥 FRONTEND: Fetching my projects from MongoDB');
    const response = await api.get('/projects/mine');
    console.log('📥 FRONTEND: Raw response data:', response.data);
    let projects = response.data;
    // Handle different response formats
    if (Array.isArray(response.data)) {
      projects = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      projects = response.data.data;
    } else {
      console.error('❌ FRONTEND: Unexpected response format for /mine:', response.data);
      projects = [];
    }
    console.log('📤 FRONTEND: Retrieved projects from MongoDB:', projects.length || 'N/A');
    return projects;
  },

  // Get all projects (admin/assessor)
  listAllProjects: async (): Promise<Project[]> => {
    console.log('📥 FRONTEND: Fetching all projects from MongoDB');
    const response = await api.get('/projects');
    console.log('📥 FRONTEND: Raw response data:', response.data);
    let projects = response.data;
    // Handle different response formats
    if (response.data.data && Array.isArray(response.data.data)) {
      projects = response.data.data;
    } else if (Array.isArray(response.data)) {
      projects = response.data;
    } else {
      console.error('❌ FRONTEND: Unexpected response format:', response.data);
      projects = [];
    }
    console.log('📤 FRONTEND: Retrieved all projects from MongoDB:', projects.length || 'N/A');
    return projects;
  },

  // Create project as faculty (with auto-assignment)
  createProjectAsFaculty: async (projectData: CreateProjectData): Promise<Project> => {
    console.log('🚀 FRONTEND: Faculty creating project:', projectData);
    const response = await api.post('/projects', projectData);
    console.log('✅ FRONTEND: Faculty project creation response:', response.data);
    return response.data.data;
  },

  // Set current faculty as supervisor
  setMeAsSupervisor: async (projectId: string): Promise<Project> => {
    console.log('👨‍🏫 FRONTEND: Setting self as supervisor for project:', projectId);
    const response = await api.patch(`/projects/${projectId}/supervisor/me`);
    console.log('✅ FRONTEND: Supervisor assignment response:', response.data);
    return response.data.data;
  },

  // Evaluate project (faculty only)
  evaluateProject: async (projectId: string, evaluationData: ProjectEvaluationData): Promise<Project> => {
    console.log('📊 FRONTEND: Evaluating project:', projectId, evaluationData);
    const response = await api.patch(`/projects/${projectId}/evaluate`, evaluationData);
    console.log('✅ FRONTEND: Project evaluation response:', response.data);
    return response.data.data;
  }
};
