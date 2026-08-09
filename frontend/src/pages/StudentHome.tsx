import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogOut, Target, Zap, GraduationCap, Calculator } from 'lucide-react';

const StudentHome: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-secondary-light dark:text-secondary-dark font-medium">
              Welcome back, {user?.name?.split(' ')[0]}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-surface-light dark:bg-surface-dark px-4 py-2.5 rounded-full shadow-sm border border-divider-light dark:border-divider-dark">
            <Link
              to="/history"
              className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
            >
              History
            </Link>
            <div className="w-px h-4 bg-divider-light dark:bg-divider-dark"></div>
            <Link
              to="/analytics"
              className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
            >
              Analytics
            </Link>
            <div className="w-px h-4 bg-divider-light dark:bg-divider-dark"></div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Step 1: Mode Selection Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark flex items-center gap-2">
            Select Practice Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Practice Card */}
            <button
              onClick={() => navigate('/custom-practice')}
              className="relative flex flex-col items-start p-6 rounded-2xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark hover:border-accent/50 transition-all text-left overflow-hidden h-40 group"
            >
              <Target size={28} className="mb-3 text-accent" />
              <h3 className="font-bold text-lg mb-1">Custom Practice</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                Focus on specific subjects and topics.
              </p>
            </button>

            {/* Math Practice Card */}
            <button
              onClick={() => navigate('/math-practice')}
              className="relative flex flex-col items-start p-6 rounded-2xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark hover:border-accent/50 transition-all text-left overflow-hidden h-40 group"
            >
              <Calculator size={28} className="mb-3 text-accent" />
              <h3 className="font-bold text-lg mb-1">Math Practice</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                Squares, cubes, tables &amp; arithmetic.
              </p>
              <span className="absolute top-4 right-4 bg-accent/10 text-accent text-xs px-2 py-1 rounded-md font-bold">
                New
              </span>
            </button>

            {/* Mock Card */}
            <button
              disabled
              className="relative flex flex-col items-start p-6 rounded-2xl border-2 border-transparent bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark opacity-60 cursor-not-allowed text-left overflow-hidden h-40"
            >
              <GraduationCap size={28} className="mb-3 text-secondary-light dark:text-secondary-dark" />
              <h3 className="font-bold text-lg mb-1">Mock Exam</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                Full-length simulated test.
              </p>
              <span className="absolute top-4 right-4 bg-divider-light dark:bg-divider-dark text-xs px-2 py-1 rounded-md font-bold text-secondary-light dark:text-secondary-dark">
                Coming Soon
              </span>
            </button>

            {/* Rapid Card */}
            <button
              disabled
              className="relative flex flex-col items-start p-6 rounded-2xl border-2 border-transparent bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark opacity-60 cursor-not-allowed text-left overflow-hidden h-40"
            >
              <Zap size={28} className="mb-3 text-warning-DEFAULT" />
              <h3 className="font-bold text-lg mb-1">Rapid Fire</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                Speed drills against the clock.
              </p>
              <span className="absolute top-4 right-4 bg-divider-light dark:bg-divider-dark text-xs px-2 py-1 rounded-md font-bold text-secondary-light dark:text-secondary-dark">
                Coming Soon
              </span>
            </button>
          </div>
        </section>


      </div>
    </div>
  );
};

export default StudentHome;
