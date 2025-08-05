import ServicePageContent from '@/components/ServicePageContent';
import Spinner from '@/components/ui/Spinner';
import { Suspense } from 'react';

// CORRECTED: params is a Promise
interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  return (
    <Suspense fallback={<Spinner />}>
      {/* Pass the promise down */}
      <ServicePageContent params={params} />
    </Suspense>
  );
};

export default ServiceDetailPage;
