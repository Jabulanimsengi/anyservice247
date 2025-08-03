// src/app/explore/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import ServiceCard from '@/components/ServiceCard';
import ServiceCardSkeleton from '@/components/ServiceCardSkeleton';
import { Suspense } from 'react';
import BackButton from '@/components/BackButton';

export const dynamic = 'force-dynamic';

const ExploreGrid = async () => {
  const supabase = await createClient(); // Correctly await the client
  const { data: services, error } = await supabase
    .from('service_with_ratings')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching recent services:", error.message);
    return <p className="text-center text-red-500">Failed to load services.</p>;
  }

  if (!services || services.length === 0) {
      return <p className="text-center text-gray-500">No new services found.</p>
  }

  return (
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
          status={service.status}
          locations={service.locations}
        />
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ServiceCardSkeleton key={i} />
    ))}
  </div>
);

const ExplorePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Explore Recent Listings</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <ExploreGrid />
      </Suspense>
    </div>
  );
};

export default ExplorePage;