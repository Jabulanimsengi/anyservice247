// src/components/EmergencyServices.tsx
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

const EmergencyServices = async () => {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from('service_with_ratings')
    .select('*, profiles(business_name)')
    .eq('status', 'approved')
    .eq('available_for_emergencies', true)
    .limit(10);

  if (error || !services || services.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
        <CategoryRow 
            category="Urgent Services" 
            services={services as ServiceWithProvider[]} 
            viewAllLink="/search?emergency=true" // <-- This is the new custom link
        />
    </div>
  );
};

export default EmergencyServices;