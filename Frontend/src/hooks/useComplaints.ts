import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsAPI } from '@/lib/api';
import { toast } from 'sonner';

export const useComplaints = () => {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const response = await complaintsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: complaintsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    },
  });
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      complaintsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: complaintsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
    },
  });
};