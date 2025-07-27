// src/app/service/[id]/page.tsx
import ServicePageContent from '@/components/ServicePageContent';
import { Suspense } from 'react';

interface ServiceDetailPageProps {
  params: { id: string };
}

// This component now just gets the 'id' and passes it to the new component.
const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  const { id } = params;

  return (
    <Suspense fallback={<div className="text-center py-12">Loading service...</div>}>
      <ServicePageContent id={id} />
    </Suspense>
  );
};

export default ServiceDetailPage;