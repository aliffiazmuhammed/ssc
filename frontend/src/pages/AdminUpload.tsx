import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, LogOut } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const SUBJECTS = [
  'Quantitative Aptitude',
  'Reasoning',
  'English',
  'General Awareness',
];

const AdminUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [stats, setStats] = useState<{ total: number; inserted: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout, user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
      setStats(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('error');
      setMessage('Please select a JSON file to upload.');
      return;
    }

    setStatus('uploading');
    setMessage('');
    setStats(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    try {
      const response = await api.post('/questions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setStatus('success');
      setStats({
        total: response.data.data.totalInFile,
        inserted: response.data.data.inserted,
        skipped: response.data.data.skippedDuplicates,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to upload questions.');
    }
  };

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-light dark:text-primary-dark tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">Logged in as {user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-secondary-light hover:text-error dark:text-secondary-dark dark:hover:text-error transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-8">
          <h2 className="text-xl font-semibold text-primary-light dark:text-primary-dark mb-6">Upload Questions</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-2">
                Select Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-divider-light dark:border-divider-dark bg-transparent focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-primary-light dark:text-primary-dark"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub} className="bg-surface-light dark:bg-surface-dark">
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-light dark:text-primary-dark mb-2">
                JSON File
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  file ? 'border-accent bg-accent/5' : 'border-divider-light dark:border-divider-dark hover:border-accent'
                }`}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className={`h-10 w-10 ${file ? 'text-accent' : 'text-secondary-light dark:text-secondary-dark'}`} />
                  <span className="text-primary-light dark:text-primary-dark font-medium">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-secondary-light dark:text-secondary-dark">
                    Only .json files are supported
                  </span>
                </label>
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-center space-x-2 bg-error-tint text-error p-4 rounded-xl">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {status === 'success' && stats && (
              <div className="bg-success-tint text-success-DEFAULT p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium text-sm">Upload Successful!</p>
                </div>
                <div className="pl-7 text-sm space-y-1">
                  <p>Total questions in file: <strong>{stats.total}</strong></p>
                  <p>Successfully inserted: <strong>{stats.inserted}</strong></p>
                  <p>Skipped duplicates: <strong>{stats.skipped}</strong></p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'uploading' || !file}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all font-medium text-[16px] disabled:opacity-70"
            >
              {status === 'uploading' ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Upload Questions'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
