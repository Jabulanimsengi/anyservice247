// src/components/Lightbox.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  // Keyboard navigation for the lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, onClose]);

  return (
    // Main overlay, clicking it will close the lightbox
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      
      {/* Close Button (Top Right) */}
      <button 
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20" 
        onClick={(e) => {
          e.stopPropagation(); // Prevent background click from firing
          onClose();
        }}
        aria-label="Close image viewer"
      >
        <X size={32} />
      </button>

      {/* Image and Navigation Container */}
      <div 
        className="relative flex h-full w-full items-center justify-center p-4 md:p-8" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image area itself
      >
        {/* Previous Button */}
        <button 
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors z-20" 
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Image Display - Centered and Optimized */}
        <div className="relative h-full w-full">
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>

        {/* Next Button */}
        <button 
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors z-20" 
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="Next image"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default Lightbox;