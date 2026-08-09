import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';

type TabType = 'ows' | 'synonyms-antonyms' | 'idioms-phrases';

const TAB_INFO = [
  { id: 'ows', label: 'One Word Substitutions' },
  { id: 'synonyms-antonyms', label: 'Synonyms & Antonyms' },
  { id: 'idioms-phrases', label: 'Idioms & Phrases' }
] as const;

const DailyWordsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ows');
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDailyWords = async () => {
      try {
        const res = await api.get('/vocab/daily-words');
        setData(res.data.data);
      } catch (err) {
        setError('Failed to load daily words');
      } finally {
        setLoading(false);
      }
    };
    fetchDailyWords();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-accent w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-tint text-error p-4 rounded-xl text-center text-sm font-medium border border-error-DEFAULT/20">
        {error}
      </div>
    );
  }

  const currentWords = data[activeTab] || [];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">
        Daily Vocabulary
      </h2>
      
      <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-divider-light dark:border-divider-dark p-6 shadow-card">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-divider-light dark:border-divider-dark pb-4 mb-6 overflow-x-auto scrollbar-hide">
          {TAB_INFO.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "bg-accent/10 text-accent"
                  : "text-secondary-light dark:text-secondary-dark hover:bg-base-light dark:hover:bg-base-dark"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Word List */}
        <div className="space-y-3">
          {currentWords.length > 0 ? (
            currentWords.map((word) => (
              <div key={word._id} className="p-4 rounded-xl border border-divider-light dark:border-divider-dark bg-base-light dark:bg-base-dark">
                <h4 className="font-bold text-primary-light dark:text-primary-dark text-base">{word.word}</h4>
                <p className="text-sm text-secondary-light dark:text-secondary-dark mt-1 font-medium">{word.meaning}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-secondary-light dark:text-secondary-dark py-4 font-medium">No words found for this category today.</p>
          )}
        </div>

        {/* Explore Link */}
        <div className="mt-6 flex justify-end">
          <Link 
            to={`/vocab/${activeTab}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
          >
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DailyWordsSection;
