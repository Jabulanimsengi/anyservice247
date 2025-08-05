// src/components/StatusViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import StatusProgressBar from '@/components/StatusProgressBar';

type Status = {
  created_at: string;
  caption: string | null;
  image_urls: string[];
  profiles: {
    full_name: string;
    id: string;
    business_name: string | null;
  } | null;
};

interface StatusViewerProps {
  status: Status;
}

const StatusViewer = ({ status }: StatusViewerProps) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const provider = status.profiles;
  const imageCount = status.image_urls.length;

  const goToNext = () => {
    if (currentImageIndex < imageCount - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      router.back(); // Go back if it's the last image
    }
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };
  
  // Preload the next image for a smoother transition
  useEffect(() => {
    if (currentImageIndex < imageCount - 1) {
      const nextImageUrl = status.image_urls[currentImageIndex + 1];
      const img = new window.Image();
      img.src = nextImageUrl;
    }
  }, [currentImageIndex, imageCount, status.image_urls]);


  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-full max-h-[90vh] bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        <StatusProgressBar
          imageCount={imageCount}
          currentIndex={currentImageIndex}
          duration={5000} // 5 seconds per image
          onNext={goToNext}
        />
        
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <Link href={`/provider/${provider?.id}`} className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full bg-gray-600">
                    {/* You can add a provider's avatar here later */}
                </div>
                <span className="text-white font-semibold text-sm">{provider?.business_name || provider?.full_name}</span>
            </Link>
            <button onClick={() => router.back()} className="text-white/80 hover:text-white">
                <X size={28} />
            </button>
        </div>

        <Image
          src={status.image_urls[currentImageIndex]}
          alt={status.caption || `Status image ${currentImageIndex + 1}`}
          fill
          priority={true} // Prioritize loading the first image
          className="object-contain"
        />

        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full" onClick={goToPrevious}></div>
          <div className="w-2/3 h-full" onClick={goToNext}></div>
        </div>
        
        {status.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm text-center">{status.caption}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default StatusViewer;