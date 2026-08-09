import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface WordProps {
  word: {
    _id: string;
    vocabType: string;
    word: string;
    meaning: string;
    exampleSentence?: string;
    synonyms?: string[];
    antonyms?: string[];
    isStudied: boolean;
  };
  onToggleStudy: (id: string) => void;
}

const WordCard: React.FC<WordProps> = ({ word, onToggleStudy }) => {
  const [expanded, setExpanded] = useState(false);

  const hasExtra = !!(word.exampleSentence || (word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0));

  return (
    <div className="bg-surface-light dark:bg-surface-dark border-2 border-divider-light dark:border-divider-dark rounded-2xl overflow-hidden shadow-sm transition-colors hover:border-accent/30">
      <div 
        className={clsx("p-4 sm:p-5 flex gap-4 cursor-pointer", hasExtra ? "" : "cursor-default")}
        onClick={() => hasExtra && setExpanded(!expanded)}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStudy(word._id); }}
          className="flex-shrink-0 mt-0.5 text-secondary-light dark:text-secondary-dark hover:text-accent transition-colors focus:outline-none"
        >
          {word.isStudied ? (
            <CheckCircle2 size={24} className="text-accent" />
          ) : (
            <Circle size={24} />
          )}
        </button>
        
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark">{word.word}</h3>
          <p className="text-sm font-medium text-secondary-light dark:text-secondary-dark mt-1 leading-relaxed">
            {word.meaning}
          </p>
        </div>
        
        {hasExtra && (
          <div className="flex-shrink-0 text-secondary-light dark:text-secondary-dark self-start mt-1">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && hasExtra && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-divider-light dark:border-divider-dark mt-2 ml-[52px]">
              {word.exampleSentence && (
                <div className="mb-3">
                  <span className="text-xs font-bold text-secondary-light dark:text-secondary-dark uppercase tracking-wider block mb-1">Example</span>
                  <p className="text-sm text-primary-light dark:text-primary-dark italic">"{word.exampleSentence}"</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                {word.synonyms && word.synonyms.length > 0 && (
                  <div className="flex-1">
                    <span className="text-xs font-bold text-success-DEFAULT uppercase tracking-wider block mb-1">Synonyms</span>
                    <p className="text-sm font-medium text-primary-light dark:text-primary-dark">{word.synonyms.join(', ')}</p>
                  </div>
                )}
                
                {word.antonyms && word.antonyms.length > 0 && (
                  <div className="flex-1">
                    <span className="text-xs font-bold text-error-DEFAULT uppercase tracking-wider block mb-1">Antonyms</span>
                    <p className="text-sm font-medium text-primary-light dark:text-primary-dark">{word.antonyms.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordCard;
