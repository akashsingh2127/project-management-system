import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Plus, CheckCircle, Clock, Search, Edit2, Trash2, CheckSquare, MoreVertical, Circle } from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';

interface Task {
  id: string;
  title: string;
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
      // Use tasks mapping to match 'name'/'title' difference between DB and interface
      const rawTasks = res.data.data.tasks || res.data.data || [];
      return rawTasks as Task[];
    },
    enabled: !!id,
  });

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleToggleTaskStatus = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (projectError) return <div className="p-12 flex flex-col items-center justify-center text-center"><p className="text-destructive font-medium">Error loading project.</p><p className="text-muted-foreground mt-1 text-sm">It may have been deleted or you don't have access.</p></div>;
  if (tasksError) return <div className="p-12 flex flex-col items-center justify-center text-center"><p className="text-destructive font-medium">Error loading tasks for this project.</p></div>;
  if (isLoadingProject || isLoadingTasks) return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-8">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-10 w-1/3 mb-2" />
      <Skeleton className="h-6 w-2/3" />
      <div className="space-y-4 mt-8">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
  if (!project) return <div className="p-8 text-center text-destructive">Project not found.</div>;

  const filteredTasks = tasksData?.filter((task) => {
    const title = task.title || (task as any).name || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div>
        <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors group">
          <ArrowLeft size={16} className="mr-1.5 transition-transform group-hover:-translate-x-1" /> Back to Projects
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.name}</h1>
              <Badge 
                variant="outline" 
                className={`font-medium border-0 mt-1 hidden sm:inline-flex ${
                  project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                  project.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-secondary text-secondary-foreground'
                }`}
              >
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">{project.description || 'No description provided.'}</p>
          </div>
          <Button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} className="shadow-sm shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Task Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-8 w-px bg-border hidden sm:block mx-2"></div>
        <select
          className="w-full sm:w-48 bg-transparent text-sm font-medium focus:outline-none focus:ring-0 text-foreground cursor-pointer appearance-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Tasks</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0">
          {(!filteredTasks || filteredTasks.length === 0) ? (
            <div className="p-16 text-center flex flex-col items-center">
              <CheckSquare size={48} className="text-muted-foreground opacity-30 mb-4" />
              <p className="text-lg font-medium text-foreground">No tasks found</p>
              <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-md">
                {searchTerm || statusFilter !== 'ALL' 
                  ? "We couldn't find any tasks matching your filters."
                  : "This project doesn't have any tasks yet. Create one to start tracking work."}
              </p>
              {searchTerm || statusFilter !== 'ALL' ? (
                <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}>
                  Create First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTasks.map((task) => {
                const title = task.title || (task as any).name;
                return (
                  <div 
                    key={task.id} 
                    className="p-4 hover:bg-secondary/40 transition-colors flex items-center justify-between group cursor-pointer"
                    onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
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
                          {title}
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
                        onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsTaskModalOpen(true); }}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteTask(task.id, e)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
