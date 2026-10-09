import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { BarChart, CheckCircle2, Clock, FolderOpen, Plus, ArrowRight, Activity, Circle, CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

export default function Dashboard() {
  const { data: dashboard, isLoading: isLoadingMetrics, error: metricsError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    }
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', { limit: 3 }],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data; // Assuming it returns an array of projects or a paginated object
    }
  });

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', { limit: 5 }],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data.data;
    }
  });

  if (metricsError) return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm">
      <Activity className="h-8 w-8 mb-4 opacity-50" />
      <p>Failed to load dashboard data.</p>
    </div>
  );

  const projects = Array.isArray(projectsData) ? projectsData.slice(0, 3) : projectsData?.projects?.slice(0, 3) || [];
  const tasks = Array.isArray(tasksData) ? tasksData.slice(0, 5) : tasksData?.tasks?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Good morning</h1>
          <p className="text-base text-muted-foreground mt-1">Here's what's happening with your projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-semibold tracking-tight text-foreground">{dashboard?.totalProjects ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <BarChart className="h-4 w-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-semibold tracking-tight text-foreground">{dashboard?.totalTasks ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-500 opacity-80" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                {(dashboard?.pendingTasks || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-semibold tracking-tight text-foreground">{dashboard?.completedTasks ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Projects</h2>
            <Link to="/projects" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoadingProjects ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="shadow-sm border-border">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-2 w-full mt-4" />
                  </CardContent>
                </Card>
              ))
            ) : projects.length > 0 ? (
              projects.map((project: any) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="block group">
                  <Card className="shadow-sm border-border group-hover:border-primary/50 group-hover:shadow-md transition-all duration-200 h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || 'No description provided.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                        <span className="font-medium px-2 py-1 bg-secondary rounded-md">{project.status?.replace('_', ' ')}</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-card border border-border border-dashed rounded-xl">
                <FolderOpen className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View tasks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <Card className="shadow-sm border-border">
            <CardContent className="p-0">
              {isLoadingTasks ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="p-4 flex items-start gap-3 hover:bg-secondary/50 transition-colors">
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{task.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${
                            task.priority === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                            task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {task.project?.name || 'Project'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  You're all caught up!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
