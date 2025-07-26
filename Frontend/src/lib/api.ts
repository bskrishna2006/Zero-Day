import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Basic token validation before sending
      const parts = token.split('.');
      if (parts.length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Invalid token format, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  signup: (formData: FormData) =>
    api.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  verifyToken: () =>
    api.get('/auth/verify'),
};

export const announcementsAPI = {
  getAll: () => api.get('/announcements'),
  create: (data: any) => api.post('/announcements', data),
  update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
  markAsRead: (id: string) => api.post(`/announcements/${id}/read`),
};

export const lostFoundAPI = {
  getAll: () => api.get('/lost-found'),
  create: (data: any) => api.post('/lost-found', data),
  update: (id: string, data: any) => api.put(`/lost-found/${id}`, data),
  delete: (id: string) => api.delete(`/lost-found/${id}`),
};

export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  create: (data: any) => api.post('/timetable', data),
  update: (id: string, data: any) => api.put(`/timetable/${id}`, data),
  delete: (id: string) => api.delete(`/timetable/${id}`),
};

export const complaintsAPI = {
  getAll: () => api.get('/complaints'),
  create: (data: FormData) => {
    // For FormData, axios automatically sets the correct Content-Type
    return api.post('/complaints', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id: string, data: any) => {
    // If data is FormData, use multipart/form-data, otherwise use JSON
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
    
    return api.put(`/complaints/${id}`, data, { headers });
  },
  delete: (id: string) => api.delete(`/complaints/${id}`),
};

export const skillExchangeAPI = {
  // Teacher endpoints
  getTeachers: (params?: any) => api.get('/skill-exchange/teachers', { params }),
  getTeacher: (id: string) => api.get(`/skill-exchange/teachers/${id}`),
  createTeacher: (data: any) => api.post('/skill-exchange/teachers', data),
  updateTeacher: (id: string, data: any) => api.put(`/skill-exchange/teachers/${id}`, data),
  deleteTeacher: (id: string) => api.delete(`/skill-exchange/teachers/${id}`),
  
  // Skills endpoint
  getSkills: () => api.get('/skill-exchange/skills'),
  
  // Contact request endpoints
  getContactRequests: (params?: any) => api.get('/skill-exchange/contact-requests', { params }),
  getContactRequest: (id: string) => api.get(`/skill-exchange/contact-requests/${id}`),
  createContactRequest: (data: any) => api.post('/skill-exchange/contact-requests', data),
  updateContactRequest: (id: string, data: any) => api.put(`/skill-exchange/contact-requests/${id}`, data),
  
  // Session endpoints
  getSessions: (params?: any) => api.get('/skill-exchange/sessions', { params }),
  getSession: (id: string) => api.get(`/skill-exchange/sessions/${id}`),
  updateSession: (id: string, data: any) => api.put(`/skill-exchange/sessions/${id}`, data),
  
  // Notification endpoints
  getNotifications: (params?: any) => api.get('/skill-exchange/notifications', { params }),
  markNotificationRead: (id: string) => api.put(`/skill-exchange/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/skill-exchange/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/skill-exchange/notifications/${id}`),
  
  // Dashboard metrics
  getMetrics: () => api.get('/skill-exchange/metrics'),
};