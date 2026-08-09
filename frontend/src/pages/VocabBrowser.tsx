import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import AlphabetStrip from '../components/vocab/AlphabetStrip';
import WordCard from '../components/vocab/WordCard';
import VocabProgressBar from '../components/vocab/VocabProgressBar';

const CATEGORY_NAMES: Record<string, string> = {
  'ows': 'One Word Substitutions',
  'synonyms-antonyms': 'Synonyms & Antonyms',
  'idioms-phrases': 'Idioms & Phrases'
};

const VocabBrowser: React.FC = () => {
  const { vocabType } = useParams<{ vocabType: string }>();
  const navigate = useNavigate();
  
  const [words, setWords] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, studied: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  
  const [tier, setTier] = useState<'all' | 'top200'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [letter, setLetter] = useState<string | null>(null);
  const [studiedFilter, setStudiedFilter] = useState<'all' | 'studied' | 'unstudied'>('all');
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 300);
    return () => { if (searchTimeout.current) window.clearTimeout(searchTimeout.current); };
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [tier, letter, studiedFilter]);

  const fetchWords = useCallback(async () => {
    if (!vocabType) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('vocabType', vocabType);
      params.set('page', String(page));
      params.set('limit', '50');
      if (tier === 'top200') params.set('tier', 'top200');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (letter) params.set('letter', letter);
      if (studiedFilter !== 'all') params.set('studied', studiedFilter);
      params.set('sort', 'word:asc');

      const res = await api.get(`/vocab/words?${params.toString()}`);
      setWords(res.data.data.words);
      setPagination(res.data.data.pagination);
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Failed to fetch words');
    } finally {
      setLoading(false);
    }
  }, [vocabType, page, tier, debouncedSearch, letter, studiedFilter]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const toggleStudy = async (id: string) => {
    try {
      // Optimistic update
      setWords(prev => prev.map(w => w._id === id ? { ...w, isStudied: !w.isStudied } : w));
      
      const res = await api.post(`/vocab/words/${id}/toggle-study`);
      
      // Update with actual response just in case
      setWords(prev => prev.map(w => w._id === id ? { ...w, isStudied: res.data.data.isStudied } : w));
      
      // Update stats lightly
      setStats(prev => ({
        ...prev,
        studied: res.data.data.isStudied ? prev.studied + 1 : prev.studied - 1
      }));
    } catch (err) {
      console.error('Failed to toggle study status');
      fetchWords(); // Revert on failure
    }
  };

  const title = vocabType ? CATEGORY_NAMES[vocabType] || 'Dictionary' : 'Dictionary';

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vocab')}
              className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-secondary-light dark:text-secondary-dark"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-extrabold text-primary-light dark:text-primary-dark">
              {title}
            </h1>
          </div>
          
          <div className="flex bg-surface-light dark:bg-surface-dark p-1 rounded-xl border border-divider-light dark:border-divider-dark">
            <button
              onClick={() => setTier('all')}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-colors",
                tier === 'all' ? "bg-accent text-white" : "text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
              )}
            >
              All Words
            </button>
            <button
              onClick={() => setTier('top200')}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-colors",
                tier === 'top200' ? "bg-accent text-white" : "text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
              )}
            >
              Top 200
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-divider-light dark:border-divider-dark shadow-sm">
           <VocabProgressBar studied={stats.studied} total={stats.total} />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-light dark:text-secondary-dark" size={20} />
            <input
              type="text"
              placeholder="Search words or meanings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark focus:outline-none focus:border-accent text-primary-light dark:text-primary-dark font-medium transition-colors"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <AlphabetStrip activeLetter={letter} onSelect={setLetter} />
          
          <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
            {(['all', 'studied', 'unstudied'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStudiedFilter(filter)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-colors capitalize whitespace-nowrap",
                  studiedFilter === filter
                    ? "bg-primary-light dark:bg-primary-dark text-surface-light dark:text-surface-dark"
                    : "bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-secondary-light dark:text-secondary-dark hover:border-accent/40"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Word List */}
        <div className="space-y-3 min-h-[400px]">
          {loading ? (
             <div className="flex justify-center items-center py-20">
               <Loader2 className="animate-spin text-accent w-10 h-10" />
             </div>
          ) : words.length === 0 ? (
            <div className="bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark rounded-2xl p-10 text-center">
               <p className="text-secondary-light dark:text-secondary-dark font-medium text-lg">No words found matching your criteria.</p>
               <button 
                 onClick={() => { setSearch(''); setLetter(null); setStudiedFilter('all'); setTier('all'); }}
                 className="mt-4 text-accent font-bold hover:underline"
               >
                 Clear Filters
               </button>
            </div>
          ) : (
            words.map(word => (
              <WordCard key={word._id} word={word} onToggleStudy={toggleStudy} />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-divider-light dark:border-divider-dark">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark disabled:opacity-50 transition-colors hover:border-accent/40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm font-bold text-secondary-light dark:text-secondary-dark">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark text-primary-light dark:text-primary-dark disabled:opacity-50 transition-colors hover:border-accent/40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VocabBrowser;
