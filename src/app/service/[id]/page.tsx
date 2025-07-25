// src/app/service/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import BackButton from '@/components/BackButton';
import ServiceInteraction from '@/components/ServiceInteraction';
import { revalidatePath } from 'next/cache';

// --- Type Definitions ---
type Service = {
  title: string;
  price: number;
  description: string;
  user_id: string;
  provider_name: string | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string; } | null;
};

// Define the props interface for the page
interface ServiceDetailPageProps {
  params: { id: string };
}

// The page is an async Server Component
const ServiceDetailPage = async ({ params }: ServiceDetailPageProps) => {
  // Access id directly from params to avoid the Turbopack issue
  const id = params.id;

  // --- Data Fetching on the Server ---
  const { data: service, error: serviceError } = await supabase
    .from('service_with_ratings')
    .select(`title, price, description, user_id, provider_name`)
    .eq('id', id)
    .single();

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`*, profiles(full_name)`)
    .eq('service_id', id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
    
  if (serviceError || !service) {
    return <div className="text-center py-12">Service not found.</div>;
  }

  // This function will be passed to the client component to trigger a server-side data refresh
  const handleReviewSubmitted = async () => {
    'use server';
    revalidatePath(`/service/${id}`);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      {/* Service Details */}
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold">{service.title}</h1>
        <p className="mt-2 text-lg text-gray-500">
          by <a href={`/provider/${service.user_id}`} className="font-semibold text-blue-500">{service.provider_name ?? 'Anonymous'}</a>
        </p>
        <div className="my-6 border-t"></div>
        <div className="mb-6">
          <span className="text-3xl font-bold">R{Number(service.price).toFixed(2)}</span>
        </div>
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold">About this service</h2>
          <p>{service.description || 'No description provided.'}</p>
        </div>
        
        {/* Render the interactive parts using the new client component */}
        <ServiceInteraction 
          serviceId={id} 
          serviceProviderId={service.user_id}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <div className="mt-6 space-y-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.profiles?.full_name ?? 'Anonymous'}</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="mt-4 text-gray-500">No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
