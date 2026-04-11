import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Demo mode - set headers for evaluation operations
api.interceptors.request.use((config: any) => {
  // Set demo headers for authentication
  config.headers['x-user-id'] = 'demo-faculty-1'; // Default demo faculty ID
  config.headers['x-user-role'] = 'faculty'; // Default role
  console.log('EVALUATION API REQUEST - Using demo headers for authentication');
  return config;
});

export interface Evaluation {
  _id: string;
  projectId: string;
  assessorId: string;
  assessorName: string;
  assessorRole: string;
  criteria: Array<{
    name: string;
    maxScore: number;
    score?: number;
    comment: string;
  }>;
  finalComment: string;
  totalScore: number;
  status: 'Pending' | 'Submitted';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationSummary {
  totalEvaluations: number;
  averageScore: number;
  criteriaAverages: Array<{
    name: string;
    average: number;
  }>;
  evaluations: Array<{
    id: string;
    assessorName: string;
    assessorRole: string;
    totalScore: number;
    submittedAt?: string;
  }>;
}

export const evaluationApi = {
  // List evaluations for a project
  list: async (projectId?: string, assessorId?: string): Promise<Evaluation[]> => {
    try {
      console.log('📥 FRONTEND: Fetching evaluations from MongoDB');
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (assessorId) params.append('assessorId', assessorId);

      const response = await api.get(`/evaluations?${params.toString()}`);
      console.log('📤 FRONTEND: Retrieved evaluations from MongoDB:', response.data.data?.length || 'N/A');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ FRONTEND: Error fetching evaluations:', error);
      return [];
    }
  },

  // Get evaluation summary for a project
  summary: async (projectId: string): Promise<EvaluationSummary> => {
    try {
      console.log('📥 FRONTEND: Fetching evaluation summary from MongoDB');
      const response = await api.get(`/evaluations/project/${projectId}/summary`);
      console.log('📤 FRONTEND: Retrieved evaluation summary:', response.data.data);
      return response.data.data || {
        totalEvaluations: 0,
        averageScore: 0,
        criteriaAverages: [],
        evaluations: []
      };
    } catch (error) {
      console.error('❌ FRONTEND: Error fetching evaluation summary:', error);
      return {
        totalEvaluations: 0,
        averageScore: 0,
        criteriaAverages: [],
        evaluations: []
      };
    }
  },

  // Faculty assigns themselves to evaluate a project
  create: async (data: { projectId: string; assessorRole: string; assessorId?: string; assessorName?: string }): Promise<Evaluation> => {
    try {
      console.log('🚀 FRONTEND: Creating evaluation assignment:', data);
      const response = await api.post('/evaluations', data);
      console.log('✅ FRONTEND: Evaluation assignment created:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ FRONTEND: Error creating evaluation assignment:', error);
      throw error;
    }
  },

  // Update evaluation with scores
  update: async (id: string, updates: Partial<Evaluation>): Promise<Evaluation> => {
    try {
      console.log('🚀 FRONTEND: Updating evaluation:', id, updates);
      const response = await api.put(`/evaluations/${id}`, updates);
      console.log('✅ FRONTEND: Evaluation updated:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ FRONTEND: Error updating evaluation:', error);
      throw error;
    }
  },

  // Get single evaluation
  get: async (id: string): Promise<Evaluation> => {
    try {
      console.log('📥 FRONTEND: Fetching single evaluation:', id);
      const response = await api.get(`/evaluations/${id}`);
      console.log('📤 FRONTEND: Retrieved evaluation:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ FRONTEND: Error fetching evaluation:', error);
      throw error;
    }
  },

  // Delete evaluation
  delete: async (id: string): Promise<void> => {
    try {
      console.log('🗑️ FRONTEND: Deleting evaluation:', id);
      await api.delete(`/evaluations/${id}`);
      console.log('✅ FRONTEND: Evaluation deleted');
    } catch (error: any) {
      console.error('❌ FRONTEND: Error deleting evaluation:', error);
      throw error;
    }
  }
};
