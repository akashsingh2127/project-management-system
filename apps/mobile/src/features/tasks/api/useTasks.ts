import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Task } from '../../../types';

export const useTasks = (projectId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['tasks', projectId, page, limit],
    queryFn: async () => {
      const response = await api.get<{ data: Task[]; meta: any }>('/tasks', {
        params: { projectId, page, limit },
      });
      return response.data;
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.patch(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
