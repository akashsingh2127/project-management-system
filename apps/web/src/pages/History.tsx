import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Search, CheckCircle, Clock, CheckSquare, FolderOpen, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  updatedAt: string;
  project?: {
    name: string;
  };
}

export default function History() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(1);
  const limit = 20; // Show more on history page

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { page, limit, status: 'COMPLETED' }],
    queryFn: async () => {
      const res = await api.get(`/tasks?page=${page}&limit=${limit}&status=COMPLETED`);
      return {
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

  const handleReopenTask = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/tasks/${task.id}`, { status: 'PENDING' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error(err);
      alert('Failed to reopen task');
    }
  };

  const filteredTasks = tasks?.filter((task) => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">History</h1>
          <p className="text-base text-muted-foreground mt-1">Review your completed tasks and past achievements.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search completed tasks..."
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <Skeleton className="h-8 w-24 shrink-0 rounded-md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              Failed to load history.
            </div>
          ) : filteredTasks?.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <CheckSquare size={48} className="text-muted-foreground opacity-30 mb-4" />
              <p className="text-lg font-medium text-foreground">No completed tasks yet</p>
              <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-md">
                {searchTerm 
                  ? "We couldn't find any completed tasks matching your search."
                  : "Complete tasks in your projects to see them appear here."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTasks?.map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 hover:bg-secondary/40 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-emerald-500">
                      <CheckCircle size={22} className="fill-emerald-50" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-sm font-medium truncate text-muted-foreground line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5 line-clamp-1 opacity-70">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center mt-2 gap-2 text-xs">
                        <span 
                          className="flex items-center text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors px-1.5 py-0.5 rounded-sm bg-secondary"
                          onClick={() => navigate(`/projects/${task.projectId}`)}
                        >
                          <FolderOpen size={12} className="mr-1" />
                          {task.project?.name || task.projectId.split('-')[0] + '...'}
                        </span>
                        <span className="flex items-center text-muted-foreground font-medium">
                          <Clock size={12} className="mr-1" />
                          Completed on {new Date(task.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleReopenTask(task, e)}
                    >
                      <RotateCcw size={14} className="mr-1.5" />
                      Reopen
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
    </div>
  );
}
