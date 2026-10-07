import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import { setAuthToken } from './api/client';

function App() {
  const { isLoading, error, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently().then((token) => {
        if (token) setAuthToken(token);
      }).catch(console.error);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          <p className="text-gray-500">
            {error.message.includes('User did not authorize') || error.message.includes('access_denied')
              ? "Sign-in was cancelled. You can try again whenever you're ready."
              : error.message}
          </p>
          <button
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            onClick={() => loginWithRedirect({ authorizationParams: { prompt: 'login' } })}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={returnTo} replace />
          ) : (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Project Management System</h1>
                <p className="text-gray-500">Log in to manage your projects and tasks.</p>
                <button
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  onClick={() => loginWithRedirect({ appState: { returnTo } })}
                >
                  Log In
                </button>
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
      </Route>
    </Routes>
  );
}

export default App;
