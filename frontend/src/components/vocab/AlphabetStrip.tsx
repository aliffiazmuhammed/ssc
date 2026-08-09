import React from 'react';
import clsx from 'clsx';

interface AlphabetStripProps {
  activeLetter: string | null;
  onSelect: (letter: string | null) => void;
}

const AlphabetStrip: React.FC<AlphabetStripProps> = ({ activeLetter, onSelect }) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          'flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-colors border-2',
          activeLetter === null
            ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
            : 'border-divider-light dark:border-divider-dark text-secondary-light dark:text-secondary-dark hover:border-accent/40 hover:text-primary-light dark:hover:text-primary-dark'
        )}
      >
        All
      </button>
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => onSelect(letter)}
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-colors border-2',
            activeLetter === letter
              ? 'border-accent bg-accent text-white shadow-md shadow-accent/20'
              : 'border-divider-light dark:border-divider-dark text-secondary-light dark:text-secondary-dark hover:border-accent/40 hover:text-primary-light dark:hover:text-primary-dark'
          )}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetStrip;
