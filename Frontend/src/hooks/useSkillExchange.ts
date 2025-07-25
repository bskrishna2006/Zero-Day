import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillExchangeAPI } from '@/lib/api';
import { toast } from 'sonner';

// Peer Teacher Hooks
export const usePeerTeachers = (filters?: any) => {
  return useQuery({
    queryKey: ['peerTeachers', filters],
    queryFn: async () => {
      const response = await skillExchangeAPI.getTeachers(filters);
      return response.data;
    },
  });
};

export const usePeerTeacher = (id: string) => {
  return useQuery({
    queryKey: ['peerTeacher', id],
    queryFn: async () => {
      const response = await skillExchangeAPI.getTeacher(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreatePeerTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: skillExchangeAPI.createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peerTeachers'] });
      toast.success('Teacher profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create teacher profile');
    },
  });
};

export const useUpdatePeerTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      skillExchangeAPI.updateTeacher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['peerTeachers'] });
      queryClient.invalidateQueries({ queryKey: ['peerTeacher', variables.id] });
      toast.success('Teacher profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update teacher profile');
    },
  });
};

export const useDeletePeerTeacher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: skillExchangeAPI.deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peerTeachers'] });
      toast.success('Teacher profile deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete teacher profile');
    },
  });
};

// Skills Hooks
export const useAvailableSkills = () => {
  return useQuery({
    queryKey: ['skillsAvailable'],
    queryFn: async () => {
      const response = await skillExchangeAPI.getSkills();
      return response.data;
    },
  });
};

// Contact Request Hooks
export const useContactRequests = (filters?: any) => {
  return useQuery({
    queryKey: ['contactRequests', filters],
    queryFn: async () => {
      const response = await skillExchangeAPI.getContactRequests(filters);
      return response.data;
    },
  });
};

export const useContactRequest = (id: string) => {
  return useQuery({
    queryKey: ['contactRequest', id],
    queryFn: async () => {
      const response = await skillExchangeAPI.getContactRequest(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateContactRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: skillExchangeAPI.createContactRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
      toast.success('Contact request sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send contact request');
    },
  });
};

export const useUpdateContactRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      skillExchangeAPI.updateContactRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
      queryClient.invalidateQueries({ queryKey: ['contactRequest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['learningSessions'] });
      toast.success('Contact request updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update contact request');
    },
  });
};

// Learning Session Hooks
export const useLearningSession = (id: string) => {
  return useQuery({
    queryKey: ['learningSession', id],
    queryFn: async () => {
      const response = await skillExchangeAPI.getSession(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useLearningSessionsList = (filters?: any) => {
  return useQuery({
    queryKey: ['learningSessions', filters],
    queryFn: async () => {
      const response = await skillExchangeAPI.getSessions(filters);
      return response.data;
    },
  });
};

export const useUpdateLearningSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      skillExchangeAPI.updateSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learningSessions'] });
      queryClient.invalidateQueries({ queryKey: ['learningSession', variables.id] });
      toast.success('Learning session updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update learning session');
    },
  });
};

// Notification Hooks
export const useNotifications = (filters?: any) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const response = await skillExchangeAPI.getNotifications(filters);
      return response.data;
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      skillExchangeAPI.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark notification as read');
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: skillExchangeAPI.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark all notifications as read');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      skillExchangeAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Dashboard Metrics Hook
export const useSkillExchangeMetrics = () => {
  return useQuery({
    queryKey: ['skillExchangeMetrics'],
    queryFn: async () => {
      const response = await skillExchangeAPI.getMetrics();
      return response.data;
    },
  });
};