// src/components/ServiceCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Star, Heart, MapPin } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@supabase/supabase-js';

interface ServiceCardProps {
  id: number;
  providerId: string;
  imageUrl: string | null;
  title: string;
  providerName: string;
  rating: number;
  reviewCount: number;
  price: number;
  is_approved: boolean;
  locations: string[] | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id, providerId, imageUrl, title, providerName, rating, reviewCount, price, is_approved, locations
}) => {
  const { likedServiceIds, addLike, removeLike, addToast } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false); // State to prevent double-clicks

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

    if (isLiking) return; // Prevent action if already processing
    setIsLiking(true);

    try {
      if (isLiked) {
        const query = supabase.from('likes').delete().eq('service_id', id);
        if (user) {
          query.eq('user_id', user.id);
        } else {
          query.eq('guest_id', guestId);
        }
        const { error } = await query;
        
        if (!error) {
          removeLike(id);
          addToast('Removed from your Likes', 'error');
        }
      } else {
        const likeData = {
          service_id: id,
          user_id: user?.id,
          guest_id: user ? null : guestId,
        };
        const { error } = await supabase.from('likes').insert(likeData);
        if (!error) {
          addLike(id);
          addToast('Added to your Likes!');
        }
      }
    } finally {
      setIsLiking(false); // Re-enable the button after the operation is complete
    }
  };

  return (
    <div className="group relative flex max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-brand-teal">
      {is_approved && (
        <div className="absolute top-2 right-2 z-10">
          <VerifiedBadge />
        </div>
      )}
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={handleLike}
          disabled={isLiking} // Disable button while processing
          className="rounded-full bg-white/70 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
        </button>
      </div>
      <Link href={`/service/${id}`} passHref>
        <div className="relative h-48 w-full cursor-pointer">
          <Image
            src={imageUrl || '/placeholder.png'}
            alt={`Image for ${title}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-4">
        <h3 className="text-md font-bold tracking-tight text-gray-900">
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
            <span>{locations.join(', ')}</span>
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
            R{Number(price).toFixed(2)}
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