// src/components/ServiceGrid.tsx
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';

type ServiceWithProvider = {
  id: number;
  title: string;
  price: number;
  user_id: string;
  image_url: string | null;
  is_approved: boolean;
  locations: string[] | null;
  provider_name: string;
  average_rating: number;
  review_count: number;
};

const ServiceGrid = async () => {
  // Data is fetched on the server
  const { data: services, error } = await supabase
    .from('service_with_ratings')
    .select('*')
    .eq('is_approved', true);

  if (error) {
    console.error("Error fetching services:", error.message);
    return <p className="text-center text-red-500">Failed to load services.</p>;
  }

  return (
    <>
      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              providerId={service.user_id}
              title={service.title}
              providerName={service.provider_name ?? 'Anonymous'}
              rating={service.average_rating}
              reviewCount={service.review_count}
              price={service.price}
              imageUrl={service.image_url}
              is_approved={service.is_approved}
              locations={service.locations}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No services have been listed yet. Be the first!
        </p>
      )}
    </>
  );
};

export default ServiceGrid;