// src/app/browse/[province]/[city]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ServiceCard from '@/components/ServiceCard';
import BackButton from '@/components/BackButton';
import { Suspense } from 'react';
import ServiceCardSkeleton from '@/components/ServiceCardSkeleton';

interface LocationPageProps {
  params: { province: string; city: string };
}

// Define the type for a service object to fix the 'any' type error
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

// Helper function to capitalize the first letter of a string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
    const province = decodeURIComponent(params.province).replace(/-/g, ' ');
    const city = decodeURIComponent(params.city).replace(/-/g, ' ');

    return {
        title: `Find Top-Rated Services in ${capitalize(city)}, ${capitalize(province)}`,
        description: `Browse all available home services in ${capitalize(city)}. Connect with verified and reviewed local professionals for plumbing, electrical work, and more on HomeService24/7.`,
    };
}

const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );

const LocationServicesPage = async ({ params }: LocationPageProps) => {
    const provinceParam = decodeURIComponent(params.province);
    const cityParam = decodeURIComponent(params.city);
    const provinceForQuery = capitalize(provinceParam);
    const cityForQuery = capitalize(cityParam);

    const supabase = await createClient();

    const { data: services, error } = await supabase
        .rpc('get_services_by_location', {
            p_city: cityForQuery,
            p_province: provinceForQuery
        });
    
    if (error) {
        console.error("Error calling RPC function:", error.message);
        return <div className="text-center py-10">Error fetching services. Please check the function name and permissions in Supabase.</div>
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="text-3xl font-bold mb-2 capitalize">{cityParam.replace(/-/g, ' ')}, {provinceParam.replace(/-/g, ' ')}</h1>
            <p className="mb-6 text-gray-600">Browse all available professionals in your area.</p>

            <Suspense fallback={<LoadingSkeleton />}>
                {services && services.length > 0 ? (
                     <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {services.map((service: Service) => (
                           <ServiceCard
                                key={service.id}
                                variant="compact" // This ensures the compact style is used
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
            </Suspense>
        </div>
    );
};

export default LocationServicesPage;