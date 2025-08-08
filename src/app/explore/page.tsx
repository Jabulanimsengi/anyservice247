// src/app/explore/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import ServiceCard from '@/components/ServiceCard';
import SearchFilters from '@/components/SearchFilters';
import { Suspense } from 'react';
import ServiceCardSkeleton from '@/components/ServiceCardSkeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Services',
  description: 'Find and filter through all available home service professionals in South Africa. Search by category, location, and more.',
};

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

const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
);

const ExplorePage = async () => {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from('service_with_ratings')
    .select('*, profiles(business_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching recent services:", error.message);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Explore Services</h1>
      <SearchFilters />
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Listings</h2>
        <Suspense fallback={<LoadingSkeleton />}>
            {services && services.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {services.map((service: Service) => (
                        <ServiceCard
                            key={service.id}
                            variant="compact" // This is the fix
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
                <p>No recent services found.</p>
            )}
        </Suspense>
      </div>
    </div>
  );
};

export default ExplorePage;
