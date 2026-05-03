import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  if (userId) config.headers['x-user-id'] = userId;
  if (userRole) config.headers['x-user-role'] = userRole;
  
  return config;
});

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  role: string;
  universityId: string;
}

export const userApi = {
  searchUsers: async (query?: string, role?: string): Promise<UserSearchResult[]> => {
    const response = await api.get('/users/search', {
      params: { query, role }
    });
    return response.data;
  }
};
