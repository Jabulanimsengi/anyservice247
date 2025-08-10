// src/app/browse/[province]/[city]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import ServiceGridClient from '@/components/ServiceGridClient';
import PageLoader from '@/components/PageLoader'; // Import the new component

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

    const { data: initialServices, error } = await supabase
        .from('service_with_ratings')
        .select('*, profiles(business_name)')
        .eq('status', 'approved')
        .contains('locations', `[{"city":"${capitalize(cityParam)}","province":"${capitalize(provinceParam)}"}]`)
        .range(0, 19);
    
    if (error) {
        console.error("Error fetching location services:", error.message);
        return <div className="text-center py-10">Error fetching services. Please try again later.</div>
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <PageLoader /> {/* Add the page loader here */}
            <BackButton />
            <h1 className="text-3xl font-bold mb-2 capitalize">{cityParam}</h1>
            <p className="mb-6 text-gray-600">Browse all available professionals in your area.</p>
            
            <ServiceGridClient 
                initialServices={initialServices || []} 
                city={capitalize(cityParam)} 
                province={capitalize(provinceParam)}
            />
        </div>
    );
};

export default LocationServicesPage;