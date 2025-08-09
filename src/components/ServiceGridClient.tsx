// src/components/ServiceGridClient.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

// Define the type for a single service object
type Service = {
  id: number;
  user_id: string;
  title: string;
  provider_name: string;
  profiles?: { business_name?: string | null } | null;
  average_rating: number;
  review_count: number;
  price: number;
  call_out_fee: number;
  image_urls: string[] | null;
  status: string;
  locations: any; 
  availability: any; 
};

interface ServiceGridClientProps {
  initialServices: Service[];
  city: string;
  province: string;
}

const POSTS_PER_PAGE = 20; // How many services to load at a time

const ServiceGridClient: React.FC<ServiceGridClientProps> = ({ initialServices, city, province }) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialServices.length === POSTS_PER_PAGE);

  const loadMoreServices = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const from = nextPage * POSTS_PER_PAGE - POSTS_PER_PAGE;
    const to = nextPage * POSTS_PER_PAGE - 1;

    const { data, error } = await supabase
        .rpc('get_services_by_location_paginated', {
            p_city: city,
            p_province: province,
            p_limit: POSTS_PER_PAGE,
            p_offset: from
        });

    if (error) {
      console.error("Error fetching more services:", error);
    } else {
      if (data && data.length > 0) {
        setServices(prev => [...prev, ...data]);
        setPage(nextPage);
      }
      if (!data || data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  return (
    <>
      {services.length > 0 ? (
        // --- THIS LINE IS UPDATED ---
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {services.map((service: Service) => (
            <ServiceCard
              key={service.id}
              variant="compact"
              id={String(service.id)}
              providerId={service.user_id}
              title={service.title}
              providerName={service.provider_name}
              businessName={service.profiles?.business_name ?? undefined}
              rating={service.average_rating}
              reviewCount={service.review_count}
              price={service.price}
              call_out_fee={service.call_out_fee}
              imageUrls={service.image_urls}
              status={service.status}
              locations={service.locations}
              availability={service.availability}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-dashed border-2 border-gray-300 rounded-lg">
          <h2 className="text-xl font-semibold">No Services Found</h2>
          <p className="text-gray-500 mt-2">There are currently no service providers listed for this location.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        {loading && <Spinner />}
        {!loading && hasMore && (
            <Button onClick={loadMoreServices} size="lg">Load More Services</Button>
        )}
        {!loading && !hasMore && services.length > 0 && (
            <p className="text-gray-500">You've reached the end.</p>
        )}
      </div>
    </>
  );
};

export default ServiceGridClient;