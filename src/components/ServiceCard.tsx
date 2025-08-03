// src/components/ServiceCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Star, Heart, MapPin, MessageSquare } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@supabase/supabase-js';

type ServiceLocation = {
  province: string;
  city: string;
};

interface ServiceCardProps {
  id: number;
  providerId: string;
  imageUrls: string[] | null;
  title: string;
  providerName: string;
  rating: number;
  reviewCount: number;
  price: number;
  status: string;
  locations: ServiceLocation[] | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id, providerId, imageUrls, title, providerName, rating, reviewCount, price, status, locations
}) => {
  const { likedServiceIds, addLike, removeLike, addToast, openChat } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  const displayImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : '/placeholder.png';

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    let currentGuestId = localStorage.getItem('guestId');
    if (!currentGuestId) {
      currentGuestId = uuidv4();
      localStorage.setItem('guestId', currentGuestId);
    }
    setGuestId(currentGuestId);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isLiked = likedServiceIds.has(id);

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
      if (isLiked) {
        const { error } = await supabase.from('likes').delete().eq('service_id', id).eq('user_id', user.id);
        if (!error) {
            removeLike(id);
            addToast('Service removed from likes.', 'success');
        }
      } else {
        const { error } = await supabase.from('likes').insert({ service_id: id, user_id: user.id });
        if (!error) {
            addLike(id);
            addToast('Service added to likes!', 'success');
        }
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

  return (
    <div className="group relative flex max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-brand-teal h-full">
      {status === 'approved' && (
        <div className="absolute top-2 right-2 z-10">
          <VerifiedBadge />
        </div>
      )}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="rounded-full bg-white/70 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Like service"
        >
          <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
        </button>
        <button
          onClick={handleStartChat}
          className="rounded-full bg-white/70 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-brand-blue"
          aria-label="Message provider"
        >
          <MessageSquare size={20} />
        </button>
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
        <Link href={`/provider/${providerId}`} passHref>
          <p className="cursor-pointer text-sm text-blue-500 hover:underline">
            by {providerName}
          </p>
        </Link>
        
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

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            from R{Number(price).toFixed(2)}/hr
          </span>
          <Link href={`/service/${id}`} passHref>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;