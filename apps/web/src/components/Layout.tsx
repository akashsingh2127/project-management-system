import { Outlet, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Home, Folder, CheckSquare, LogOut } from 'lucide-react';

export function Layout() {
  const { logout, user } = useAuth0();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">PMS</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/projects" className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
            <Folder size={20} />
            <span>Projects</span>
          </Link>
          <Link to="/tasks" className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
            <CheckSquare size={20} />
            <span>Tasks</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex items-center space-x-3 text-red-600 p-2 rounded-lg hover:bg-red-50 w-full"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
