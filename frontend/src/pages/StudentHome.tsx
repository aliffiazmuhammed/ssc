import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogOut, Target, Zap, Calculator, BookOpen, Library } from 'lucide-react';
import DailyWordsSection from '../components/vocab/DailyWordsSection';
import ThemeToggle from '../components/ThemeToggle';

const StudentHome: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent to-fuchsia-600 p-8 sm:p-10 shadow-lg shadow-accent/20">
          {/* Abstract background shapes */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-1 sm:mb-2">
                Dashboard
              </h1>
              <p className="text-base sm:text-lg text-white/90 font-medium">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 md:mt-0">
              <Link
                to="/history"
                className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                History
              </Link>
              <Link
                to="/analytics"
                className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                Analytics
              </Link>
              <Link
                to="/bookmarks"
                className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                Bookmarks
              </Link>
              <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1 hidden sm:block"></div>
              <ThemeToggle className="!bg-white/20 hover:!bg-white/30 !border-white/20 !text-white hover:!text-white !shadow-sm p-1.5 sm:p-2" />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/20 hover:bg-error/90 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 1: Mode Selection Cards */}
        <section className="space-y-6 mt-8">
          <h2 className="text-2xl font-extrabold text-primary-light dark:text-primary-dark flex items-center gap-2">
            Practice Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Practice Card */}
            <button
              onClick={() => navigate('/custom-practice')}
              className="relative flex flex-col items-start p-6 rounded-3xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-accent/50 transition-all duration-300 text-left overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"></div>
              <div className="bg-accent/10 p-3.5 rounded-2xl mb-5 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300 text-accent">
                <Target size={28} />
              </div>
              <h3 className="font-extrabold text-xl mb-2 text-primary-light dark:text-primary-dark">Custom Practice</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark leading-relaxed">
                Focus on specific subjects and topics.
              </p>
            </button>

            {/* Math Practice Card */}
            <button
              onClick={() => navigate('/math-practice')}
              className="relative flex flex-col items-start p-6 rounded-3xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/50 transition-all duration-300 text-left overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"></div>
              <div className="bg-blue-500/10 p-3.5 rounded-2xl mb-5 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 text-blue-500">
                <Calculator size={28} />
              </div>
              <h3 className="font-extrabold text-xl mb-2 text-primary-light dark:text-primary-dark">Math Practice</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark leading-relaxed">
                Squares, cubes, tables &amp; arithmetic.
              </p>
              <span className="absolute top-5 right-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-sm">
                New
              </span>
            </button>

            {/* Vocab Card */}
            <button
              onClick={() => navigate('/vocab')}
              className="relative flex flex-col items-start p-6 rounded-3xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-fuchsia-500/50 transition-all duration-300 text-left overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"></div>
              <div className="bg-fuchsia-500/10 p-3.5 rounded-2xl mb-5 group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300 text-fuchsia-500">
                <BookOpen size={28} />
              </div>
              <h3 className="font-extrabold text-xl mb-2 text-primary-light dark:text-primary-dark">English Vocab</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark leading-relaxed">
                Master OWS, Synonyms, Antonyms.
              </p>
              <span className="absolute top-5 right-5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-sm">
                New
              </span>
            </button>

            {/* Question Bank Card */}
            <button
              onClick={() => navigate('/question-bank')}
              className="relative flex flex-col items-start p-6 rounded-3xl bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/50 transition-all duration-300 text-left overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"></div>
              <div className="bg-teal-500/10 p-3.5 rounded-2xl mb-5 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 text-teal-600 dark:text-teal-400">
                <Library size={28} />
              </div>
              <h3 className="font-extrabold text-xl mb-2 text-primary-light dark:text-primary-dark">Question Bank</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark leading-relaxed">
                Browse and study questions.
              </p>
            </button>

            {/* Rapid Card */}
            <button
              disabled
              className="relative flex flex-col items-start p-6 rounded-3xl bg-surface-light dark:bg-surface-dark border border-transparent shadow-sm opacity-60 cursor-not-allowed text-left overflow-hidden"
            >
              <div className="bg-warning-DEFAULT/10 p-3.5 rounded-2xl mb-5 text-warning-DEFAULT">
                <Zap size={28} />
              </div>
              <h3 className="font-extrabold text-xl mb-2 text-primary-light dark:text-primary-dark">Rapid Fire</h3>
              <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark leading-relaxed">
                Speed drills against the clock.
              </p>
              <span className="absolute top-5 right-5 bg-divider-light dark:bg-divider-dark text-xs px-2.5 py-1 rounded-lg font-bold text-secondary-light dark:text-secondary-dark">
                Coming Soon
              </span>
            </button>
          </div>
        </section>


        <DailyWordsSection />

      </div>
    </div>
  );
};

export default StudentHome;
