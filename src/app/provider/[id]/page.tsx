// src/app/provider/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import ServiceCard from '@/components/ServiceCard';
import BackButton from '@/components/BackButton';
import { notFound } from 'next/navigation';
import { Twitter, Linkedin, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProviderProfilePageProps {
  params: Promise<{ id: string }>;
}

// CORRECTED: This interface now accurately reflects the data from the database
interface Service {
  id: number; // ID from Supabase is a number
  user_id: string;
  title: string;
  provider_name: string | null;
  profiles: {
    business_name: string | null;
  } | null;
  average_rating: number;
  review_count: number;
  price: number;
  call_out_fee: number;
  image_urls: string[] | null;
  status: string;
  locations: { city: string, province: string }[] | null;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } };
}

const ProviderProfilePage = async ({ params }: ProviderProfilePageProps) => {
  const { id } = await params;
  if (!id) notFound();

  const supabase = await createClient();

  const profilePromise = supabase
    .from('profiles')
    .select('full_name, portfolio, qualifications, social_media, business_name')
    .eq('id', id)
    .single();

  const servicesPromise = supabase
    .from('service_with_ratings')
    .select('*, profiles(business_name)')
    .eq('user_id', id);

  const completedJobsPromise = supabase
    .from('bookings')
    .select('id', { count: 'exact' })
    .eq('provider_id', id)
    .eq('status', 'completed');

  const [{ data: profile, error: profileError }, { data: services, error: servicesError }, { count: completedJobsCount }] = await Promise.all([
    profilePromise,
    servicesPromise,
    completedJobsPromise,
  ]);


  if (profileError || !profile) {
    notFound();
  }

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-bold text-brand-blue">{profile.business_name || profile.full_name}</h1>
        {profile.business_name && (
          <p className="text-lg text-gray-500">Operated by {profile.full_name}</p>
        )}
        <p className="mt-2 font-semibold text-green-600">{completedJobsCount || 0} Jobs Completed</p>
        {profile.social_media && (
          <div className="mt-4 flex space-x-4">
            {profile.social_media.twitter && <a href={profile.social_media.twitter} target="_blank" rel="noopener noreferrer"><Twitter /></a>}
            {profile.social_media.linkedin && <a href={profile.social_media.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a>}
            {profile.social_media.website && <a href={profile.social_media.website} target="_blank" rel="noopener noreferrer"><Globe /></a>}
          </div>
        )}
      </div>

      {profile.qualifications && profile.qualifications.length > 0 && (
          <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Qualifications</h2>
              <ul className="list-disc list-inside space-y-2">
                  {profile.qualifications.map((q: string, i: number) => <li key={i}>{q}</li>)}
              </ul>
          </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Services offered by {profile.business_name || profile.full_name}</h2>
      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service: Service) => (
            <ServiceCard
              key={service.id}
              id={String(service.id)} // CORRECTED: Convert number to string here
              providerId={service.user_id}
              title={service.title}
              providerName={service.provider_name ?? 'Anonymous'}
              businessName={service.profiles?.business_name ?? undefined} // CORRECTED: Handle null case
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
        <p>This provider has not listed any services yet.</p>
      )}
    </div>
  );
};

export default ProviderProfilePage;