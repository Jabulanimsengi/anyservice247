// src/app/likes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';
import { useStore } from '@/lib/store';
import { User } from '@supabase/supabase-js';

type LikedService = {
  id: number;
  title: string;
  price: number;
  user_id: string;
  image_url: string | null;
  is_approved: boolean;
  profiles: {
    full_name: string;
  }[];
};

const LikesPage = () => {
  const [likedServices, setLikedServices] = useState<LikedService[]>([]);
  const [loading, setLoading] = useState(true);
  const { likedServiceIds } = useStore();

  useEffect(() => {
    const fetchLikedServices = async () => {
      if (likedServiceIds.size === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('services')
        .select(`
          id, title, price, user_id, image_url, is_approved,
          profiles (full_name)
        `)
        .in('id', Array.from(likedServiceIds))
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching liked services:', error);
      } else {
        setLikedServices(data || []);
      }
      setLoading(false);
    };

    fetchLikedServices();
  }, [likedServiceIds]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Your Liked Services</h1>
      {loading ? (
        <p>Loading your liked items...</p>
      ) : likedServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {likedServices.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              providerId={service.user_id}
              title={service.title}
              providerName={service.profiles[0]?.full_name ?? 'Anonymous'}
              rating={5.0}
              reviewCount={0}
              price={service.price}
              imageUrl={service.image_url}
              is_approved={service.is_approved}
              locations={null} // You can add locations here if needed
            />
          ))}
        </div>
      ) : (
        <p>You haven't liked any services yet. Start browsing to find services you love!</p>
      )}
    </div>
  );
};

export default LikesPage;