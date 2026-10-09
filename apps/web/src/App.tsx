import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import History from './pages/History';
import { setTokenProvider } from './api/client';
import { Briefcase, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTokenProvider(() => getAccessTokenSilently());
    setIsReady(true);
  }, [getAccessTokenSilently]);

  if (!isReady) return null;

  return <>{children}</>;
};

function App() {
  const { isLoading, error, isAuthenticated, loginWithRedirect } = useAuth0();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Handle genuine 401s from the API (e.g., token expired and silent refresh failed)
  useEffect(() => {
    const handleUnauthorized = () => {
      if (isAuthenticated) {
        const currentPath = window.location.pathname + window.location.search;
        loginWithRedirect({ appState: { returnTo: currentPath } });
      }
    };
    
    window.addEventListener('unauthorized_api_error', handleUnauthorized);
    return () => window.removeEventListener('unauthorized_api_error', handleUnauthorized);
  }, [isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <Briefcase className="h-10 w-10 text-primary" />
          <p className="text-sm font-medium tracking-wide">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card border rounded-2xl shadow-sm p-8 text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">Authentication Error</h1>
            <p className="text-sm text-muted-foreground">
              {error.message.includes('User did not authorize') || error.message.includes('access_denied')
                ? "Sign-in was cancelled. You can try again whenever you're ready."
                : error.message}
            </p>
          </div>
          <button
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => loginWithRedirect({ appState: { returnTo: window.location.pathname } })}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AxiosInterceptor>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to={returnTo} replace />
            ) : (
              <div className="flex min-h-screen w-full bg-background font-sans">
                {/* Left Side: Branding / Visual */}
                <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 p-12 text-white flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-xl font-bold">
                      <Briefcase className="h-6 w-6" />
                      <span>ProjectFlow</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-4xl font-semibold tracking-tight leading-tight">
                      Manage your projects with absolute clarity.
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                      Streamline your workflow, track tasks, and collaborate effortlessly in a single unified workspace.
                    </p>
                    
                    <div className="space-y-4 pt-8 text-sm text-zinc-300">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Real-time task tracking and status updates</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Custom project workflows and priorities</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Enterprise-grade security and authentication</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle background decoration */}
                  <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none" />
                </div>

                {/* Right Side: Login */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12">
                  <div className="w-full max-w-[400px] space-y-8">
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 text-xl font-bold lg:hidden mb-12">
                      <Briefcase className="h-6 w-6 text-primary" />
                      <span>ProjectFlow</span>
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                      <h2 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h2>
                      <p className="text-sm text-muted-foreground">
                        Log in or create an account to access your workspace.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        onClick={() => loginWithRedirect({ appState: { returnTo } })}
                      >
                        Continue with Auth0
                        <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    
                    <p className="text-center text-xs text-muted-foreground mt-8">
                      By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            )
          } 
        />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </AxiosInterceptor>
  );
}

export default App;
