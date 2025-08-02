// src/app/provider/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';
import BackButton from '@/components/BackButton';
import { notFound } from 'next/navigation';
import { Twitter, Linkedin, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProviderProfilePageProps {
  params: Promise<{ id: string }>;
}

const ProviderProfilePage = async ({ params }: ProviderProfilePageProps) => {
  const { id } = await params;
  if (!id) notFound();

  const profilePromise = supabase
    .from('profiles')
    .select('full_name, portfolio, qualifications, social_media')
    .eq('id', id)
    .single();

  const servicesPromise = supabase
    .from('service_with_ratings')
    .select('*')
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
        <h1 className="text-4xl font-bold">{profile.full_name}</h1>
        <p className="text-lg text-gray-500">Service Provider</p>
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

      <h2 className="text-2xl font-bold mb-6">Services offered by {profile.full_name}</h2>
      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service: any) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              providerId={service.user_id}
              title={service.title}
              providerName={service.provider_name ?? 'Anonymous'}
              rating={service.average_rating}
              reviewCount={service.review_count}
              price={service.price}
              imageUrls={service.image_urls}
              status={service.status} // CORRECTED: Changed from is_approved to status
              locations={service.locations}
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