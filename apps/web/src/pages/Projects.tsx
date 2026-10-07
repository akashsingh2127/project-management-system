import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Search, Edit2, Trash2, MoreVertical, Plus, FolderOpen, Calendar, Activity } from 'lucide-react';
import { ProjectModal } from '../components/ProjectModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export default function Projects() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', { page, limit }],
    queryFn: async () => {
      const res = await api.get(`/projects?page=${page}&limit=${limit}`);
      return {
        projects: res.data.data as Project[],
        meta: res.data.meta as { total: number; page: number; limit: number; totalPages: number }
      };
    }
  });

  const projects = data?.projects;
  const meta = data?.meta;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Projects</h1>
          <p className="text-base text-muted-foreground mt-1">Manage and track all your workspaces.</p>
        </div>
        <Button onClick={() => { setEditingProject(null); setIsModalOpen(true); }} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects by name..."
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
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
          <option value="ALL">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="shadow-sm border-border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mt-4" />
              </CardContent>
              <CardFooter className="pt-0">
                <Skeleton className="h-6 w-24 rounded-full" />
              </CardFooter>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-card border border-border rounded-xl shadow-sm text-center">
            <Activity className="h-8 w-8 text-destructive opacity-80 mb-4" />
            <p className="text-foreground font-medium">Failed to load projects.</p>
            <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-16 bg-card border border-border border-dashed rounded-xl text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
            <p className="text-lg font-medium text-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL' 
                ? "We couldn't find any projects matching your current filters."
                : "You haven't created any projects yet. Get started by creating your first workspace."}
            </p>
            {searchTerm || statusFilter !== 'ALL' ? (
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          filteredProjects?.map((project) => (
            <Card 
              key={project.id}
              className="shadow-sm border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full group"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors" title={project.name}>
                    {project.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0 -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => handleEdit(project, e)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDelete(project.id, e)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2 mt-1 min-h-[2.5rem]">
                  {project.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4 mt-auto">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                  Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 pb-4">
                <Badge 
                  variant="outline" 
                  className={`font-medium border-0 ${
                    project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                    project.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === 'COMPLETED' ? 'bg-emerald-500' :
                      project.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`} />
                    {project.status.replace('_', ' ')}
                  </span>
                </Badge>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
          <div>
            Showing <span className="font-medium text-foreground">{filteredProjects?.length || 0}</span> on page <span className="font-medium text-foreground">{meta.page}</span> of <span className="font-medium text-foreground">{meta.totalPages}</span>
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

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={editingProject} 
      />
    </div>
  );
}
