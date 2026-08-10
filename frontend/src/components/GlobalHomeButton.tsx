import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const GlobalHomeButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hiddenRoutes = ['/', '/login', '/register', '/admin'];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const goHome = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={goHome}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-accent/90 hover:bg-accent backdrop-blur-md text-white shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95 group flex items-center justify-center gap-2"
      title="Go Home"
    >
      <Home size={18} className="group-hover:animate-pulse" />
      <span className="font-bold text-sm hidden sm:inline">Home</span>
    </button>
  );
};

export default GlobalHomeButton;
