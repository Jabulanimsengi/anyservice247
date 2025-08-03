// src/app/status/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import StatusProgressBar from '@/components/StatusProgressBar';

interface StatusPageProps {
  params: Promise<{ id: string }>; // The type indicates params is a Promise
}

type Status = {
  created_at: string;
  caption: string | null;
  image_urls: string[];
  profiles: {
    full_name: string;
    id: string;
  } | null;
};

const StatusPage = ({ params }: StatusPageProps) => {
  const router = useRouter();
  const { id } = use(params); // Correctly use the 'use' hook for client components
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!id) return notFound();

      const { data, error } = await supabase
        .from('status_updates')
        .select('*, profiles(full_name, id)')
        .eq('id', id)
        .single();

      if (error || !data) {
        return notFound();
      }
      setStatus(data as any);
      setLoading(false);
    };

    fetchStatus();
  }, [id]);

  const goToNext = () => {
    if (status && currentImageIndex < status.image_urls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      router.back(); // Go back if it's the last image
    }
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  if (!status) return null;

  const provider = status.profiles;
  const imageCount = status.image_urls.length;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-full max-h-[90vh] bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        {/* --- Progress Bars --- */}
        <StatusProgressBar
          imageCount={imageCount}
          currentIndex={currentImageIndex}
          duration={5000} // 5 seconds per image
          onNext={goToNext}
        />
        
        {/* --- Header Info --- */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <Link href={`/provider/${provider?.id}`} className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full bg-gray-600">
                    {/* Placeholder for provider avatar, you can add this later */}
                </div>
                <span className="text-white font-semibold text-sm">{provider?.full_name}</span>
            </Link>
            <button onClick={() => router.back()} className="text-white/80 hover:text-white">
                <X size={28} />
            </button>
        </div>

        {/* --- Main Image --- */}
        <Image
          src={status.image_urls[currentImageIndex]}
          alt={status.caption || `Status image ${currentImageIndex + 1}`}
          fill
          className="object-contain"
        />

        {/* --- Navigation Controls (invisible) --- */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full" onClick={goToPrevious}></div>
          <div className="w-2/3 h-full" onClick={goToNext}></div>
        </div>
        
        {/* --- Caption --- */}
        {status.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm text-center">{status.caption}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage;