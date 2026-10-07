import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { DashboardMetrics } from '../../../types';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardMetrics }>('/dashboard');
      return response.data.data;
    },
  });
};
