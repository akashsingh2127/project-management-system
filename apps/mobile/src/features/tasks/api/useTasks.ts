import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Task } from '../../../types';

export const useTasks = (projectId?: string, page = 1, limit = 10, search?: string, status?: string) => {
  return useQuery({
    queryKey: ['tasks', projectId, page, limit, search, status],
    queryFn: async () => {
      const response = await api.get<{ data: Task[]; meta: any }>('/tasks', {
        params: { projectId, page, limit, name: search, status },
      });
      return response.data;
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.put(`/tasks/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((task: Task) => 
            task.id === id ? { ...task, ...data } : task
          )
        };
      });
      
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData({ queryKey: ['tasks'] }, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
