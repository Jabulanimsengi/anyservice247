// src/components/ServiceCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Star, Heart, MapPin, MessageSquare, Clock } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type ServiceLocation = {
  province: string;
  city: string;
};

interface ServiceCardProps {
  id: string;
  providerId: string;
  imageUrls: string[] | null;
  title: string;
  providerName: string;
  businessName?: string;
  rating: number;
  reviewCount: number;
  price: number;
  call_out_fee?: number;
  status: string;
  locations: ServiceLocation[] | null;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } };
  variant?: 'default' | 'compact';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id, providerId, imageUrls, title, providerName, businessName, rating, reviewCount, status, locations, availability, variant = 'default'
}) => {
  const router = useRouter();
  const { likedServiceIds, addLike, removeLike, addToast, openChat } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  const displayImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : '/placeholder.png';

  const is24HourService = () => {
    if (!availability) return false;
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    return weekdays.every(day => availability[day]?.is24Hours);
  }

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isLiked = likedServiceIds.has(Number(id));

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
        addToast('Please sign in to like a service.', 'error');
        return;
    }
    if (isLiking) return;
    setIsLiking(true);

    try {
      const serviceIdNumber = Number(id);
      if (isLiked) {
        const { error } = await supabase.from('likes').delete().eq('service_id', serviceIdNumber).eq('user_id', user.id);
        if (!error) removeLike(serviceIdNumber);
      } else {
        const { error } = await supabase.from('likes').insert({ service_id: serviceIdNumber, user_id: user.id });
        if (!error) addLike(serviceIdNumber);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleStartChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
        addToast('Please sign in to send a message.', 'error');
        return;
    }
    if (user.id === providerId) {
        addToast("You can't message yourself.", 'error');
        return;
    }
    openChat(providerId, providerName);
  };

  const handleProviderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/provider/${providerId}`);
  };

  // Compact Card Variant
  if (variant === 'compact') {
    return (
      <Link href={`/service/${id}`} passHref>
        <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-brand-teal h-full">
          <div className="absolute top-1 right-1 z-20 flex flex-col gap-1.5">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="rounded-full bg-white/70 p-1.5 text-gray-600 backdrop-blur-sm transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Like service"
            >
              <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
            </button>
            {userRole !== 'provider' && userRole !== 'admin' && (
              <button
                onClick={handleStartChat}
                className="rounded-full bg-white/70 p-1.5 text-gray-600 backdrop-blur-sm transition-colors hover:text-brand-blue"
                aria-label="Message provider"
              >
                <MessageSquare size={16} />
              </button>
            )}
          </div>

          <div className="relative aspect-square w-full cursor-pointer overflow-hidden">
            <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
                {status === 'approved' && <VerifiedBadge />}
                <div className="flex items-center text-xs bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                    <span className="ml-1 font-semibold text-gray-800">{rating.toFixed(1)}</span>
                    <span className="ml-1 text-gray-600">({reviewCount})</span>
                </div>
            </div>
            <Image
              src={displayImage}
              alt={`Image for ${title}`}
              fill
              sizes="(max-width: 768px) 33vw, 12vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button size="sm">View Details</Button>
            </div>
          </div>
          <div className="p-2 flex-grow flex flex-col">
            <h3 className="text-sm font-bold tracking-tight text-gray-900 line-clamp-1">{title}</h3>
            <p onClick={handleProviderClick} className="text-xs text-blue-500 line-clamp-1 hover:underline cursor-pointer">by {businessName || providerName}</p>
            {locations && locations.length > 0 && (
              <div className="mt-auto pt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} />
                <span className="line-clamp-1">{locations[0].city}{locations.length > 1 ? ', ...' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default (Larger) Card Variant
  return (
    <div className="group relative flex max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-brand-teal h-full">
      {status === 'approved' && (
        <div className="absolute top-2 right-2 z-10">
          <VerifiedBadge />
        </div>
      )}
      {is24HourService() && (
        <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Clock size={14} className="mr-1"/> 24/7
        </div>
      )}
      <div className="absolute top-10 left-2 z-10 flex flex-col gap-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="rounded-full bg-white/70 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Like service"
        >
          <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
        </button>
        {userRole !== 'provider' && userRole !== 'admin' && (
            <button
            onClick={handleStartChat}
            className="rounded-full bg-white/70 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-brand-blue"
            aria-label="Message provider"
            >
            <MessageSquare size={20} />
            </button>
        )}
      </div>
      <Link href={`/service/${id}`} passHref>
        <div className="relative h-48 w-full cursor-pointer overflow-hidden">
          <Image
            src={displayImage}
            alt={`Image for ${title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-4">
        <h3 className="text-md font-bold tracking-tight text-gray-900 line-clamp-2">
          <Link href={`/service/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>
        <p onClick={handleProviderClick} className="cursor-pointer text-sm text-blue-500 hover:underline">
            by {businessName || providerName}
        </p>
        
        {locations && locations.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={14} />
            <span className="line-clamp-1">{locations.map(loc => loc.city).join(', ')}</span>
          </div>
        )}

        <div className="mt-2 flex items-center">
          <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
          <span className="ml-1 mr-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-600">({reviewCount} reviews)</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-start">
          <Link href={`/service/${id}`} passHref>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;