import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
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
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data.data;
      
      login(user, token);
      
      navigate('/'); // Student home
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-light dark:bg-base-dark px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-card">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-primary-light dark:text-primary-dark">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-light dark:text-secondary-dark">
            Start your practice journey today
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
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-primary-light dark:text-primary-dark"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-primary-light dark:text-primary-dark"
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
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-primary-light dark:text-primary-dark"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all font-medium text-[16px] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign up'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-secondary-light dark:text-secondary-dark">Already have an account? </span>
            <Link to="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
