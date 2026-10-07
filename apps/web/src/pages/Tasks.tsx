import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Search, Edit2, Trash2, Plus, CheckCircle, Circle, Clock, CheckSquare, FolderOpen } from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
  dueDate: string | null;
  project?: {
    name: string;
  };
}

export default function Tasks() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { page, limit }],
    queryFn: async () => {
      const res = await api.get(`/tasks?page=${page}&limit=${limit}`);
      return {
        // Map backend tasks array and ensure title field mapping
        tasks: (res.data.data.tasks || res.data.data || []).map((t: any) => ({
          ...t,
          title: t.title || t.name,
        })) as Task[],
        meta: res.data.meta as { total: number; page: number; limit: number; totalPages: number }
      };
    }
  });

  const tasks = data?.tasks;
  const meta = data?.meta;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleToggleTaskStatus = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-base text-muted-foreground mt-1">Manage and track all your cross-project tasks.</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-8 w-px bg-border hidden sm:block mx-2"></div>
        <div className="flex w-full sm:w-auto gap-4">
          <select
            className="w-full sm:w-40 bg-transparent text-sm font-medium focus:outline-none focus:ring-0 text-foreground cursor-pointer appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            className="w-full sm:w-40 bg-transparent text-sm font-medium focus:outline-none focus:ring-0 text-foreground cursor-pointer appearance-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              Failed to load tasks.
            </div>
          ) : filteredTasks?.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <CheckSquare size={48} className="text-muted-foreground opacity-30 mb-4" />
              <p className="text-lg font-medium text-foreground">No tasks found</p>
              <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-md">
                {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? "We couldn't find any tasks matching your filters."
                  : "You don't have any tasks across all projects yet."}
              </p>
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? (
                <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
                  Create First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTasks?.map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 hover:bg-secondary/40 transition-colors flex items-center justify-between group cursor-pointer"
                  onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <button 
                      onClick={(e) => handleToggleTaskStatus(task, e)}
                      className={`flex-shrink-0 focus:outline-none transition-colors rounded-full ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle size={22} className="fill-emerald-50 text-emerald-500" />
                      ) : (
                        <Circle size={22} className="opacity-50 group-hover:opacity-100" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className={`text-sm font-medium truncate transition-colors ${task.status === 'COMPLETED' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center mt-2 gap-2 text-xs">
                        <span className={`font-medium px-1.5 py-0.5 rounded-sm ${
                          task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 
                          task.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600' : 
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`font-medium px-1.5 py-0.5 rounded-sm ${
                          task.priority === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                          task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-blue-500/10 text-blue-600'
                        }`}>
                          {task.priority}
                        </span>
                        <span 
                          className="flex items-center text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors px-1.5 py-0.5 rounded-sm bg-secondary"
                          onClick={(e) => { e.stopPropagation(); navigate(`/projects/${task.projectId}`); }}
                        >
                          <FolderOpen size={12} className="mr-1" />
                          {task.project?.name || task.projectId.split('-')[0] + '...'}
                        </span>
                        {task.dueDate && (
                          <span className={`flex items-center font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Clock size={12} className="mr-1" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsModalOpen(true); }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(task.id, e)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
          <div>
            Showing <span className="font-medium text-foreground">{filteredTasks?.length || 0}</span> on page <span className="font-medium text-foreground">{meta.page}</span> of <span className="font-medium text-foreground">{meta.totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={editingTask} 
      />
    </div>
  );
}
