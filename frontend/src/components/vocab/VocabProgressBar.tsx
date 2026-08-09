import React from 'react';

interface VocabProgressBarProps {
  studied: number;
  total: number;
}

const VocabProgressBar: React.FC<VocabProgressBarProps> = ({ studied, total }) => {
  const percentage = total === 0 ? 0 : Math.round((studied / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-secondary-light dark:text-secondary-dark">
          {studied} / {total} studied ({percentage}%)
        </span>
      </div>
      <div className="w-full h-2.5 bg-divider-light dark:bg-divider-dark rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
};

export default VocabProgressBar;
