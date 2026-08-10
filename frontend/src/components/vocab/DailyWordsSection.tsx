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
    <section className="space-y-6 mt-12">
      <h2 className="text-2xl font-extrabold text-primary-light dark:text-primary-dark flex items-center gap-2">
        Daily Vocabulary
      </h2>
      
      <div className="bg-surface-light dark:bg-surface-dark rounded-[2rem] shadow-sm border border-divider-light dark:border-divider-dark p-6 sm:p-8">
        {/* Tabs - Segmented Control Style */}
        <div className="flex bg-base-light dark:bg-base-dark p-1.5 rounded-2xl mb-8 overflow-x-auto scrollbar-hide shadow-inner border border-divider-light dark:border-divider-dark gap-1">
          {TAB_INFO.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={clsx(
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300",
                activeTab === tab.id
                  ? "bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark shadow-sm ring-1 ring-divider-light dark:ring-divider-dark"
                  : "text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Word List */}
        <div className="grid gap-4 transition-all duration-300">
          {currentWords.length > 0 ? (
            currentWords.map((word) => (
              <div key={word._id} className="group p-5 rounded-2xl bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark hover:border-accent/30 hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-center min-h-[5rem]">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
                <h4 className="font-extrabold text-primary-light dark:text-primary-dark text-lg mb-1">{word.word}</h4>
                <p className="text-sm text-secondary-light dark:text-secondary-dark font-medium leading-relaxed">{word.meaning}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-secondary-light dark:text-secondary-dark py-8 font-medium">No words found for this category today.</p>
          )}
        </div>

        {/* Explore Link */}
        <div className="mt-8 flex justify-end">
          <Link 
            to={`/vocab/${activeTab}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 text-accent font-bold text-sm hover:bg-accent hover:text-white transition-all duration-300"
          >
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DailyWordsSection;
