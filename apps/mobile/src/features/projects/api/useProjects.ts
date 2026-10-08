import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Project } from '../../../types';

export const useProjects = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: ['projects', page, limit, search],
    queryFn: async () => {
      const response = await api.get<{ data: Project[]; meta: any }>('/projects', {
        params: { page, limit, name: search },
      });
      return response.data;
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
