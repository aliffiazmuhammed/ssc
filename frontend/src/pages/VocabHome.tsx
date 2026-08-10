import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ArrowLeftRight, MessageSquareQuote, Loader2, Play } from 'lucide-react';
import api from '../services/api';
import VocabProgressBar from '../components/vocab/VocabProgressBar';

const CATEGORIES = [
  { id: 'ows', title: 'One Word Substitutions', icon: BookOpen },
  { id: 'synonyms-antonyms', title: 'Synonyms & Antonyms', icon: ArrowLeftRight },
  { id: 'idioms-phrases', title: 'Idioms & Phrases', icon: MessageSquareQuote }
];

const VocabHome: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/vocab/progress');
        const progressArray = res.data.data || [];
        const progressMap: Record<string, any> = {};
        progressArray.forEach((p: any) => {
          progressMap[p.vocabType] = p;
        });
        setProgress(progressMap);
      } catch (err) {
        console.error('Failed to fetch vocab progress');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header section */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-primary-light dark:text-primary-dark tracking-tight">
              English Vocabulary
            </h1>
            <p className="mt-1 text-secondary-light dark:text-secondary-dark font-medium">
              Master OWS, Synonyms, Antonyms, and Idioms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const stats = progress[category.id] || { studied: 0, total: 0 };

            return (
              <div 
                key={category.id}
                className="bg-surface-light dark:bg-surface-dark border-2 border-divider-light dark:border-divider-dark rounded-3xl p-6 shadow-card hover:border-accent/50 transition-colors flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-accent/10 p-3 rounded-2xl text-accent">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-primary-light dark:text-primary-dark leading-tight">{category.title}</h3>
                </div>

                <div className="mb-6 flex-grow">
                  <VocabProgressBar studied={stats.studied} total={stats.total} />
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={() => navigate(`/vocab/${category.id}`)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-accent/40 transition-colors"
                  >
                    Browse Dictionary
                  </button>
                  <button
                    onClick={() => navigate(`/vocab/${category.id}/quiz`)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Start Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VocabHome;
