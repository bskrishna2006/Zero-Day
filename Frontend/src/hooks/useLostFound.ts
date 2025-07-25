import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lostFoundAPI } from '@/lib/api';
import { toast } from 'sonner';

export const useLostFoundItems = () => {
  return useQuery({
    queryKey: ['lostFound'],
    queryFn: async () => {
      const response = await lostFoundAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateLostFoundItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: lostFoundAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFound'] });
      toast.success('Item reported successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report item');
    },
  });
};

export const useUpdateLostFoundItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      lostFoundAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFound'] });
      toast.success('Item updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });
};

export const useDeleteLostFoundItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: lostFoundAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lostFound'] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });
};