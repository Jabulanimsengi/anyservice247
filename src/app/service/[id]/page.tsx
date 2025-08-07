// src/app/service/[id]/page.tsx
import ServicePageContent from '@/components/ServicePageContent';
import Spinner from '@/components/ui/Spinner';
import { Suspense } from 'react';

interface ServiceDetailPageProps {
  params: { id: string };
}

const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  return (
    <Suspense fallback={<Spinner />}>
      <ServicePageContent params={params} />
    </Suspense>
  );
};

export default ServiceDetailPage;