import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      login(user, token);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-light dark:bg-base-dark px-4 sm:px-6 lg:px-8">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center -mt-16">
        <div className="relative overflow-hidden w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-surface-light dark:bg-surface-dark shadow-xl shadow-accent/5 border border-divider-light dark:border-divider-dark">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-primary-light dark:text-primary-dark">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-light dark:text-secondary-dark">
            Sign in to continue your practice session
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-tint text-error p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:border-indigo-500 transition-colors text-primary-light dark:text-primary-dark font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:border-indigo-500 transition-colors text-primary-light dark:text-primary-dark font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all font-bold text-lg disabled:opacity-70 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-secondary-light dark:text-secondary-dark">Don't have an account? </span>
            <Link to="/register" className="font-medium text-accent hover:text-accent/80 transition-colors">
              Sign up
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Login;
