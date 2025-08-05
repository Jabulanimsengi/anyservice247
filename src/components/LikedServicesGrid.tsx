// src/components/LikedServicesGrid.tsx
'use client';

import ServiceCard from './ServiceCard';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

// This type definition should match the one in your ServiceCard component
type Service = {
  id: number;
  title: string;
  price: number;
  call_out_fee: number;
  user_id: string;
  image_urls: string[] | null;
  status: string;
  locations: { city: string, province: string }[] | null;
  provider_name: string;
  average_rating: number;
  review_count: number;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } };
  profiles: { business_name: string } | null;
};

interface LikedServicesGridProps {
  initialServices: Service[];
}

const LikedServicesGrid: React.FC<LikedServicesGridProps> = ({ initialServices }) => {
  const { likedServiceIds } = useStore();
  const [services, setServices] = useState(initialServices);

  // This effect will filter the services in real-time if the user unlikes an item on this page.
  useEffect(() => {
    setServices(initialServices.filter(service => likedServiceIds.has(service.id)));
  }, [likedServiceIds, initialServices]);

  if (services.length === 0) {
    return <p>You haven&apos;t liked any services yet. Start Browse to find services you love!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          id={String(service.id)}
          providerId={service.user_id}
          title={service.title}
          providerName={service.provider_name}
          businessName={service.profiles?.business_name}
          rating={service.average_rating}
          reviewCount={service.review_count}
          price={service.price}
          call_out_fee={service.call_out_fee}
          imageUrls={service.image_urls}
          status={service.status}
          locations={service.locations}
          availability={service.availability} // Added the availability prop here
        />
      ))}
    </div>
  );
};

export default LikedServicesGrid;