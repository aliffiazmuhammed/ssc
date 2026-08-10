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
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-500 to-fuchsia-600 p-8 sm:p-10 shadow-lg shadow-pink-500/20 mb-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
                English Vocabulary
              </h1>
              <p className="text-white/90 font-medium">
                Master OWS, Synonyms, Antonyms, and Idioms.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const stats = progress[category.id] || { studied: 0, total: 0 };

            return (
              <div 
                key={category.id}
                className="group bg-surface-light dark:bg-surface-dark rounded-[2rem] p-6 shadow-sm border border-divider-light dark:border-divider-dark hover:border-pink-500/30 hover:shadow-md transition-all duration-300 flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="bg-pink-500/10 p-3.5 rounded-2xl text-pink-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Icon size={28} />
                  </div>
                  <h3 className="font-extrabold text-xl text-primary-light dark:text-primary-dark leading-tight">{category.title}</h3>
                </div>

                <div className="mb-6 flex-grow">
                  <VocabProgressBar studied={stats.studied} total={stats.total} />
                </div>

                <div className="flex flex-col gap-3 mt-auto relative z-10">
                  <button
                    onClick={() => navigate(`/vocab/${category.id}`)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-base-light dark:bg-base-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark hover:border-pink-500/40 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
                  >
                    Browse Dictionary
                  </button>
                  <button
                    onClick={() => navigate(`/vocab/${category.id}/quiz`)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={16} fill="currentColor" />
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
