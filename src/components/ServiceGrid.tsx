// src/components/ServiceGrid.tsx
import { supabase } from '@/lib/supabase';
import CategoryRow from './CategoryRow';

type ServiceLocation = {
  province: string;
  city: string;
};

type ServiceWithProvider = {
  id: number;
  title: string;
  price: number;
  user_id: string;
  image_urls: string[] | null;
  status: string; // Changed from is_approved
  locations: ServiceLocation[] | null;
  provider_name: string;
  average_rating: number;
  review_count: number;
  category: string;
};

const ServiceGrid = async () => {
  // CORRECTED: The query now filters by status = 'approved'
  const { data: services, error } = await supabase
    .from('service_with_ratings')
    .select('*')
    .eq('status', 'approved') // Use the new status column
    .limit(280); 

  if (error) {
    console.error("Error fetching services:", error.message);
    return <p className="text-center text-red-500">Failed to load services.</p>;
  }

  const servicesByCategory: { [key: string]: ServiceWithProvider[] } = {};
  if (services) {
    for (const service of services) {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      if (servicesByCategory[service.category].length < 40) {
        servicesByCategory[service.category].push(service as ServiceWithProvider);
      }
    }
  }

  return (
    <>
      {Object.keys(servicesByCategory).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <CategoryRow key={category} category={category} services={categoryServices} />
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