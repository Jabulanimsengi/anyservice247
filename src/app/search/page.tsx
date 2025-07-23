// src/app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';

type ServiceWithProvider = {
  id: number;
  title: string;
  price: number;
  user_id: string;
  image_url: string | null;
  is_approved: boolean; // Add is_approved
  profiles: {
    full_name: string;
  }[];
};

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          price,
          user_id,
          image_url,
          is_approved,
          profiles (
            full_name
          )
        `)
        .eq('is_approved', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);


      if (error) {
        console.error('Error searching services:', error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <p>Searching...</p>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
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
              is_approved={service.is_approved} // Pass the prop
            />
          ))}
        </div>
      ) : (
        <p>No services found matching your search.</p>
      )}
    </div>
  );
};

export default SearchPage;