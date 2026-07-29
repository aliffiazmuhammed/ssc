import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Loader2, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalQuizzes: number;
    avgScore: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState<'latest' | 'oldest' | 'name'>('latest');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${page}&limit=${limit}&sort=${sort}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-primary-light dark:text-primary-dark flex items-center gap-2">
              <UserCog className="text-accent" />
              Manage Users
            </h1>
            <p className="text-sm text-secondary-light dark:text-secondary-dark mt-1">
              View and manage user accounts and their access
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-surface-light dark:bg-surface-dark p-1 rounded-lg border border-divider-light dark:border-divider-dark">
            <span className="text-sm text-secondary-light dark:text-secondary-dark px-2">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as any); setPage(1); }}
              className="bg-transparent text-sm text-primary-light dark:text-primary-dark border-none focus:ring-0 outline-none pr-4"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-error-tint text-error p-4 rounded-xl flex items-center space-x-2">
            <ShieldAlert size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-surface-light dark:bg-surface-dark shadow-card rounded-2xl overflow-hidden border border-divider-light dark:border-divider-dark">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-divider-light dark:divide-divider-dark">
              <thead className="bg-base-light/50 dark:bg-base-dark/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
                    Stats
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-secondary-light dark:text-secondary-dark uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider-light dark:divide-divider-dark">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin h-8 w-8 text-accent mx-auto" />
                      <p className="mt-2 text-secondary-light dark:text-secondary-dark">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-light dark:text-secondary-dark">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-base-light/50 dark:hover:bg-base-dark/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary-light dark:text-primary-dark">
                              {u.name}
                              {u.role === 'admin' && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-secondary-light dark:text-secondary-dark">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-light dark:text-secondary-dark">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-light dark:text-secondary-dark">
                        <div className="flex flex-col">
                          <span>Quizzes: {u.stats?.totalQuizzes || 0}</span>
                          <span>Avg Score: {u.stats?.avgScore ? u.stats.avgScore.toFixed(1) : 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive 
                            ? 'bg-success-tint text-success-DEFAULT' 
                            : 'bg-error-tint text-error'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {u._id !== currentUser?.id && u.role !== 'admin' ? (
                          <button
                            onClick={() => toggleUserStatus(u._id)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              u.isActive
                                ? 'text-error bg-error-tint/50 hover:bg-error-tint'
                                : 'text-success-DEFAULT bg-success-tint/50 hover:bg-success-tint'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-secondary-light dark:text-secondary-dark text-xs italic">
                            Cannot modify
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 bg-base-light/30 dark:bg-base-dark/30 border-t border-divider-light dark:border-divider-dark flex items-center justify-between">
              <div className="text-sm text-secondary-light dark:text-secondary-dark">
                Showing <span className="font-medium text-primary-light dark:text-primary-dark">{((page - 1) * limit) + 1}</span> to <span className="font-medium text-primary-light dark:text-primary-dark">{Math.min(page * limit, pagination.total)}</span> of <span className="font-medium text-primary-light dark:text-primary-dark">{pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded-md text-secondary-light dark:text-secondary-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-accent text-white'
                          : 'text-secondary-light dark:text-secondary-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-1 rounded-md text-secondary-light dark:text-secondary-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
