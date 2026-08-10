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
      className="fixed top-4 right-20 z-[60] p-2.5 sm:p-3 rounded-full bg-accent/90 hover:bg-accent backdrop-blur-md text-white shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95 group"
      title="Go Home"
    >
      <Home size={20} className="group-hover:animate-pulse" />
    </button>
  );
};

export default GlobalHomeButton;
