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
      className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[100] p-3 sm:p-4 rounded-full bg-accent/90 hover:bg-accent backdrop-blur-md text-white shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95 group flex items-center justify-center"
      title="Go Home"
    >
      <Home size={22} className="group-hover:animate-pulse" />
    </button>
  );
};

export default GlobalHomeButton;
