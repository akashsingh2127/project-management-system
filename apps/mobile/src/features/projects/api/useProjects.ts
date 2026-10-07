import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Project } from '../../../types';

export const useProjects = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['projects', page, limit],
    queryFn: async () => {
      const response = await api.get<{ data: Project[]; meta: any }>('/projects', {
        params: { page, limit },
      });
      return response.data;
    },
  });
};
