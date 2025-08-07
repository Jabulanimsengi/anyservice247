// src/components/ServiceGrid.tsx
import { createClient } from '@/lib/utils/supabase/server';
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
  status: string;
  locations: ServiceLocation[] | null;
  provider_name: string;
  average_rating: number;
  review_count: number;
  category: string;
  call_out_fee: number;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } };
  profiles: { business_name: string } | null;
};

const ServiceGrid = async () => {
  const supabase = await createClient();
  // CORRECTED: The query now filters by status = 'approved' and fetches business_name
  const { data: services, error } = await supabase
    .from('service_with_ratings')
    .select('*, profiles(business_name)')
    .eq('status', 'approved') // Use the new status column
    .limit(40); // REDUCED: Fetches a more reasonable number of services for the homepage

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
      // This limit can be adjusted or removed as the main query limit is now lower
      if (servicesByCategory[service.category].length < 10) { 
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