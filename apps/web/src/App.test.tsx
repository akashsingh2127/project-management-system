import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth0 } from '@auth0/auth0-react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';

vi.mock('@auth0/auth0-react');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderApp = (initialRoute = '/') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('App Routing & Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when auth0 is loading', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(),
    } as any);

    renderApp();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders login screen when unauthenticated and on root route', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(),
    } as any);

    renderApp();
    expect(screen.getByText(/Log in to manage your projects and tasks/i)).toBeInTheDocument();
  });

  it('redirects to dashboard when authenticated on root route', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { name: 'Test User' },
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn().mockResolvedValue('token'),
    } as any);

    renderApp();
    // Since we redirect to /dashboard and Layout is rendered
    expect(screen.getAllByText(/Dashboard/i)[0]).toBeInTheDocument();
  });

  it('protects routes when unauthenticated', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(),
    } as any);

    renderApp('/dashboard');
    // Should be redirected to root / login
    expect(screen.getByText(/Log in to manage your projects and tasks/i)).toBeInTheDocument();
  });
});
