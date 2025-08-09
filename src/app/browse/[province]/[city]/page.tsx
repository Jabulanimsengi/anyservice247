// src/app/browse/[province]/[city]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import ServiceGridClient from '@/components/ServiceGridClient'; // <-- Import the new component

interface LocationPageProps {
  params: { province: string; city: string };
}

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

const LocationServicesPage = async ({ params }: LocationPageProps) => {
    const provinceParam = decodeURIComponent(params.province).replace(/-/g, ' ');
    const cityParam = decodeURIComponent(params.city).replace(/-/g, ' ');
    
    const supabase = await createClient();

    // Fetch only the FIRST page of services on the server
    const { data: initialServices, error } = await supabase
        .rpc('get_services_by_location_paginated', {
            p_city: capitalize(cityParam),
            p_province: capitalize(provinceParam),
            p_limit: 20, // Fetch the first 20
            p_offset: 0
        });
    
    if (error) {
        console.error("Error calling RPC function:", error.message);
        return <div className="text-center py-10">Error fetching services. Please check the function name and permissions in Supabase.</div>
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="text-3xl font-bold mb-2 capitalize">{cityParam}</h1>
            <p className="mb-6 text-gray-600">Browse all available professionals in your area.</p>
            
            {/* Render the client component with the initial data */}
            <ServiceGridClient 
                initialServices={initialServices || []} 
                city={capitalize(cityParam)} 
                province={capitalize(provinceParam)}
            />
        </div>
    );
};

export default LocationServicesPage;