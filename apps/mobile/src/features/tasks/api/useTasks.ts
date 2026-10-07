import { useQuery } from '@tanstack/react-query';
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
