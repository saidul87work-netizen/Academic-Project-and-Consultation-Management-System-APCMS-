import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ReservationPayload {
  type: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees?: number;
  notes?: string;
}

export const reservationApi = {
  list: async () => {
    const response = await api.get('/reservations');
    return response.data.data;
  },
  create: async (data: ReservationPayload) => {
    const response = await api.post('/reservations', data);
    return response.data.data;
  },
  cancel: async (id: string) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data.data;
  }
};
