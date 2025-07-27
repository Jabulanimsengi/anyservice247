// src/app/service/[id]/page.tsx
import ServicePageContent from '@/components/ServicePageContent';
import { Suspense } from 'react';

interface ServiceDetailPageProps {
  params: { id: string };
}

// This component now just passes the entire params object down.
const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading service...</div>}>
      <ServicePageContent params={params} />
    </Suspense>
  );
};

export default ServiceDetailPage;