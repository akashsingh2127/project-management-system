import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { BarChart, CheckCircle2, Clock, FolderOpen } from 'lucide-react';

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalProjects}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <BarChart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.totalTasks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.completedTasks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{dashboard.pendingTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
