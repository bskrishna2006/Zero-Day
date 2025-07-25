import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableAPI } from '@/lib/api';
import { toast } from 'sonner';

export const useTimetable = () => {
  return useQuery({
    queryKey: ['timetable'],
    queryFn: async () => {
      const response = await timetableAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateTimetableEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: timetableAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create timetable entry');
    },
  });
};

export const useUpdateTimetableEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      timetableAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update timetable entry');
    },
  });
};

export const useDeleteTimetableEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: timetableAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable entry deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete timetable entry');
    },
  });
};