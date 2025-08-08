// src/app/service/[id]/page.tsx
import ServicePageContent from '@/components/ServicePageContent';
import Spinner from '@/components/ui/Spinner';
import { createClient } from '@/lib/utils/supabase/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface ServiceDetailPageProps {
  params: { id: string };
}

// Type assertion for Supabase relationships
type Profile = { business_name: string | null; full_name: string | null; };
type ServiceWithProfile = {
    title: string;
    description: string | null;
    locations: { city: string; province: string; }[] | null;
    profiles: Profile | Profile[] | null;
};

// Function to generate dynamic metadata
export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
    const { id } = params;
    const supabase = await createClient();

    const { data: services } = await supabase
        .rpc('get_service_by_id', {
            service_id_param: parseInt(id)
        });
    const service = services?.[0] as ServiceWithProfile | undefined;

    if (!service) {
        return {
            title: 'Service Not Found',
            description: 'The service you are looking for could not be found.',
        };
    }
    
    const profile = Array.isArray(service.profiles) ? service.profiles[0] : service.profiles;
    const providerName = profile?.business_name || profile?.full_name || 'a trusted provider';
    const location = service.locations?.[0] ? `${service.locations[0].city}, ${service.locations[0].province}` : 'South Africa';

    return {
        title: `${service.title} in ${location} | HomeService24/7`,
        description: `Looking for a reliable ${service.title.toLowerCase()} in ${location}? Get a quote from ${providerName} on HomeService24/7. Verified and reviewed by your neighbours. ${service.description?.substring(0, 100)}...`,
    };
}


const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  return (
    <Suspense fallback={<Spinner />}>
      <ServicePageContent params={params} />
    </Suspense>
  );
};

export default ServiceDetailPage;