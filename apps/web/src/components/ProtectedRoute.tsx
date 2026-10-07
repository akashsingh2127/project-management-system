import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/?returnTo=${currentPath}`} replace />;
  }

  return children;
}
