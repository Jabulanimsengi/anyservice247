// src/app/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import ServiceGrid from '@/components/ServiceGrid';
import ServiceCardSkeleton from '@/components/ServiceCardSkeleton';
import SearchFilters from '@/components/SearchFilters';

// Add this line to force the page to always fetch fresh data
export const dynamic = 'force-dynamic';

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ServiceCardSkeleton key={i} />
    ))}
  </div>
);

export default function Home() {
  return (
    <div>
      <HeroSection />
      <div className="sticky top-0 z-40 bg-gray-100/95 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4">
          <SearchFilters />
        </div>
      </div>
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <ServiceGrid />
          </Suspense>
        </div>
      </section>
    </div>
  );
}