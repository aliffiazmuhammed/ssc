import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, UploadCloud, Users } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import ThemeToggle from '../ThemeToggle';

const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark flex flex-col">
      {/* Navbar */}
      <nav className="bg-surface-light dark:bg-surface-dark shadow-sm border-b border-divider-light dark:border-divider-dark sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold text-accent">AdminPanel</span>
              
              <div className="hidden sm:flex space-x-4">
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-secondary-light dark:text-secondary-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:text-primary-light dark:hover:text-primary-dark'
                    }`
                  }
                >
                  <UploadCloud size={18} />
                  <span>Upload Questions</span>
                </NavLink>
                
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-secondary-light dark:text-secondary-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:text-primary-light dark:hover:text-primary-dark'
                    }`
                  }
                >
                  <Users size={18} />
                  <span>Manage Users</span>
                </NavLink>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-light dark:text-secondary-dark hidden sm:block">
                {user?.email}
              </span>
              <div className="w-px h-4 bg-divider-light dark:bg-divider-dark hidden sm:block"></div>
              <ThemeToggle className="p-1 -mr-2 shadow-none border-none bg-transparent hover:bg-surface-light dark:hover:bg-surface-dark" />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors p-2 rounded-md"
                title="Logout"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
