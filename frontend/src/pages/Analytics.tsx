import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface TrendData {
  date: string;
  score: number;
  subject: string;
}

interface SubjectData {
  subject: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

interface TopicData {
  topic: string;
  subject: string;
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
}

const Analytics: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>([]);
  const [topicsData, setTopicsData] = useState<TopicData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const queryParam = selectedSubject !== 'All Subjects' ? `?subject=${encodeURIComponent(selectedSubject)}` : '';
        const [overviewRes, subjectsRes, topicsRes] = await Promise.all([
          api.get(`/analytics/overview${queryParam}`),
          api.get('/analytics/subjects'),
          api.get(`/analytics/topics${queryParam}`)
        ]);
        
        // Format dates for trend chart
        const formattedTrend = overviewRes.data.data.trend.map((t: any) => ({
          ...t,
          displayDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(t.date))
        }));

        setTrendData(formattedTrend);
        setSubjectsData(subjectsRes.data.data.subjects);
        setTopicsData(topicsRes.data.data.topics);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedSubject]);

  // Derived state for the UI
  const availableSubjects = ['All Subjects', ...subjectsData.map(s => s.subject)];
  const barChartData = selectedSubject === 'All Subjects' ? subjectsData : [...topicsData].reverse();
  const barChartYKey = selectedSubject === 'All Subjects' ? 'subject' : 'topic';
  const barChartTitle = selectedSubject === 'All Subjects' ? 'Subject Accuracy' : `${selectedSubject} Topics`;
  const weakestTopics = topicsData.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="bg-error-tint text-error p-4 rounded-xl font-medium">{error}</div>
        <Link to="/" className="text-accent hover:underline">Back to Dashboard</Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-light dark:text-primary-dark tracking-tight">Performance Analytics</h1>
            <p className="mt-1 text-secondary-light dark:text-secondary-dark">Track your progress and identify weaknesses</p>
          </div>
        </div>

        {/* Tabs for Subjects */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {availableSubjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedSubject === subject
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-surface-light dark:bg-surface-dark text-secondary-light dark:text-secondary-dark hover:bg-accent/10 hover:text-accent'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {trendData.length === 0 ? (
          <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-card text-center">
            <p className="text-secondary-light dark:text-secondary-dark mb-4">Complete more quizzes to generate analytics.</p>
            <Link
              to="/"
              className="inline-block py-2 px-6 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Start Practice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-6 border border-divider-light dark:border-divider-dark">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-accent" />
                <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">Score Trend Over Time</h2>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.2} />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}%`} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#888888', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--color-accent)" 
                      strokeWidth={3} 
                      dot={{ fill: 'var(--color-accent)', strokeWidth: 2 }} 
                      activeDot={{ r: 8 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-6 border border-divider-light dark:border-divider-dark flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Target className="text-primary-light dark:text-primary-dark" />
                <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">{barChartTitle}</h2>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey={barChartYKey} type="category" axisLine={false} tickLine={false} width={100} fontSize={12} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`${value}%`, 'Accuracy']}
                    />
                    <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} barSize={20} animationDuration={1500}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.accuracy >= 80 ? '#22c55e' : entry.accuracy >= 50 ? 'var(--color-accent)' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weakest Topics List */}
            <div className="lg:col-span-3 bg-error-tint/30 rounded-2xl shadow-card p-6 border border-error-DEFAULT/20">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="text-error-DEFAULT" />
                <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">Needs Improvement</h2>
                <span className="text-sm font-medium text-secondary-light dark:text-secondary-dark ml-2">(Top 5 Weakest Topics)</span>
              </div>
              
              {weakestTopics.length === 0 ? (
                <p className="text-secondary-light dark:text-secondary-dark">No topics to improve yet. Keep practicing!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weakestTopics.map((topic) => (
                    <div key={topic.topic} className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-divider-light dark:border-divider-dark flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-base-light dark:bg-base-dark text-secondary-light dark:text-secondary-dark">
                            {topic.subject}
                          </span>
                          <span className="text-xs font-bold text-error-DEFAULT bg-error-tint px-2 py-1 rounded-md">
                            {topic.accuracy}% Accuracy
                          </span>
                        </div>
                        <h3 className="font-bold text-primary-light dark:text-primary-dark text-lg line-clamp-1" title={topic.topic}>
                          {topic.topic}
                        </h3>
                      </div>
                      <p className="text-xs font-medium text-secondary-light dark:text-secondary-dark mt-4">
                        Based on {topic.totalAttempts} questions answered
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
