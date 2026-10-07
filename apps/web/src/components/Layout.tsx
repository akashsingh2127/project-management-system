import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Home, Folder, CheckSquare, LogOut, Menu, User as UserIcon, Briefcase, History } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { logout, user } = useAuth0();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/projects', icon: Folder },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'History', href: '/history', icon: History },
  ];

  const getPageTitle = () => {
    const current = navigation.find(item => location.pathname.startsWith(item.href));
    return current ? current.name : 'ProjectFlow';
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Briefcase className="text-primary-foreground h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors">ProjectFlow</h1>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border flex-shrink-0 text-secondary-foreground shadow-sm">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() || <UserIcon size={16} />}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" title={user?.name}>
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex items-center justify-center space-x-2 text-muted-foreground px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive w-full transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-foreground hidden sm:block tracking-tight">
              {getPageTitle()}
            </h2>
          </div>
          
          {/* Mobile Title (centered) */}
          <h2 className="text-lg font-semibold text-foreground sm:hidden tracking-tight">
            {getPageTitle()}
          </h2>
          
          <div className="flex items-center">
             {/* Optional: Add notification bell or other header actions here */}
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-b border-border shrink-0 z-20 shadow-md">
            <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 mt-2 border-t border-border">
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="flex w-full items-center justify-center space-x-2 text-destructive bg-destructive/10 px-3 py-3 rounded-md text-base font-medium hover:bg-destructive/20 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
