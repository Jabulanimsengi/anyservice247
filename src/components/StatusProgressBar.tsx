// src/components/StatusProgressBar.tsx
'use client';

import { useEffect } from 'react';

interface StatusProgressBarProps {
  imageCount: number;
  currentIndex: number;
  duration: number; // in milliseconds
  onNext: () => void;
}

const StatusProgressBar: React.FC<StatusProgressBarProps> = ({ imageCount, currentIndex, duration, onNext }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, onNext, duration]);

  return (
    <div className="absolute top-2 left-0 right-0 flex gap-1 px-2 z-20">
      {Array.from({ length: imageCount }).map((_, index) => (
        <div key={index} className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-white"
            style={{
              width: index < currentIndex ? '100%' : index === currentIndex ? '0%' : '0%',
              animation: index === currentIndex ? `progress-bar ${duration}ms linear` : 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default StatusProgressBar;