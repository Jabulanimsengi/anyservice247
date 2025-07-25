// src/app/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import ServiceGrid from '@/components/ServiceGrid';
import ServiceCardSkeleton from '@/components/ServiceCardSkeleton';

// This is a simple component that renders multiple skeletons
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
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Featured Services
          </h2>
          <Suspense fallback={<LoadingSkeleton />}>
            <ServiceGrid />
          </Suspense>
        </div>
      </section>
    </div>
  );
}