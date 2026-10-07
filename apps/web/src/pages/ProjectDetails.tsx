import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Plus, CheckCircle, Clock, Search, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

interface Task {
  id: string;
  name: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data as Project;
    },
    enabled: !!id,
  });

  const { data: tasksData, isLoading: isLoadingTasks, error: tasksError } = useQuery({
    queryKey: ['tasks', { projectId: id }],
    queryFn: async () => {
      const res = await api.get(`/tasks?projectId=${id}&limit=100`);
      return res.data.data as Task[];
    },
    enabled: !!id,
  });

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: id }] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId: id }] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      default: return 'outline';
    }
  };

  if (projectError) return <div className="p-8 text-center text-red-500">Error loading project. It may have been deleted or you don't have access.</div>;
  if (tasksError) return <div className="p-8 text-center text-red-500">Error loading tasks for this project.</div>;
  if (isLoadingProject || isLoadingTasks) return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <div className="space-y-2 mt-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
  if (!project) return <div className="p-8 text-center text-red-500">Project not found.</div>;

  const filteredTasks = tasksData?.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/projects" className="inline-flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{project.name}</h1>
            <p className="text-slate-500 mt-1">{project.description || 'No description provided'}</p>
          </div>
          <Button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Task Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            className="pl-8"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-10 w-full sm:w-[180px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {(!filteredTasks || filteredTasks.length === 0) ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <CheckSquare size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">No tasks found</p>
            <p className="mt-1 text-sm text-slate-500">Create a new task to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <button 
                    onClick={() => handleToggleTaskStatus(task)}
                    className={`flex-shrink-0 focus:outline-none transition-colors p-1 rounded-full ${task.status === 'COMPLETED' ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-blue-500'}`}
                    title={task.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    <CheckCircle size={24} className={task.status === 'COMPLETED' ? 'fill-current bg-white rounded-full' : ''} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {task.name}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-slate-500 truncate mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-3 text-xs">
                      <Badge variant={task.status === 'COMPLETED' ? 'default' : task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'} className="font-normal text-[10px] px-1.5 py-0">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(task.priority) as any} className="font-normal text-[10px] px-1.5 py-0">
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className={`flex items-center ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                          <Clock size={12} className="mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-blue-600"
                    onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={editingTask}
          projectId={id} // Force task creation into this project context
        />
      )}
    </div>
  );
}
