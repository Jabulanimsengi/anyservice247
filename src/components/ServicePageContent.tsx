// src/components/ServicePageContent.tsx
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import BackButton from '@/components/BackButton';
import ServiceInteraction from '@/components/ServiceInteraction';
import { revalidatePath } from 'next/cache';
import ImageGallery from './ImageGallery'; // Use the new reusable component

// --- Type Definitions ---
type Service = {
  title: string;
  price: number;
  description: string;
  user_id: string;
  provider_name: string | null;
  image_urls: string[] | null;
  provider_email: string | null;
  provider_website: string | null;
  provider_whatsapp: string | null;
  provider_office_number: string | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string; } | null;
};

interface ServicePageContentProps {
  params: Promise<{ id: string }>;
}

const ServicePageContent = async ({ params }: ServicePageContentProps) => {
  const { id } = await params;

  const { data: service, error: serviceError } = await supabase
    .from('service_with_ratings')
    .select(`
      title, price, description, user_id, provider_name, image_urls,
      provider_email, provider_website, provider_whatsapp, provider_office_number
    `)
    .eq('id', id)
    .single();

  if (serviceError || !service) {
    return <div className="text-center py-12">Service not found.</div>;
  }
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, profiles(full_name)`)
    .eq('service_id', id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const handleReviewSubmitted = async () => {
    'use server';
    revalidatePath(`/service/${id}`);
  };

  return (
    <div className="bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <BackButton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-4">
                {/* Left Column: Image Gallery */}
                <ImageGallery imageUrls={service.image_urls} itemName={service.title} />

                {/* Right Column: Service Details */}
                <div className="flex flex-col">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{service.title}</h1>
                    <p className="mt-1 text-lg">
                        by <a href={`/provider/${service.user_id}`} className="font-semibold text-blue-600 hover:underline">{service.provider_name ?? 'Anonymous'}</a>
                    </p>
                    <div className="my-6 border-t"></div>

                    <div className="mb-6"><span className="text-gray-500">from </span><span className="text-4xl font-bold text-gray-900">R{Number(service.price).toFixed(2)}</span></div>
                    
                    <div className="prose max-w-none mb-6">
                        <h2 className="text-xl font-semibold">About this service</h2>
                        <p>{service.description || 'No description provided.'}</p>
                    </div>

                    <ServiceInteraction serviceId={id} serviceProviderId={service.user_id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
            </div>

            {/* Contact & Reviews Section */}
            <div className="mt-12 border-t pt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Contact Provider</h3>
                        <ul className="space-y-2 text-gray-700">
                            {service.provider_email && <li><strong>Email:</strong> {service.provider_email}</li>}
                            {service.provider_website && <li><strong>Website:</strong> <a href={service.provider_website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{service.provider_website}</a></li>}
                            {service.provider_whatsapp && <li><strong>WhatsApp:</strong> <a href={`https://wa.me/${service.provider_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">{service.provider_whatsapp}</a></li>}
                            {service.provider_office_number && <li><strong>Office Number:</strong> {service.provider_office_number}</li>}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                         {reviews && reviews.length > 0 ? (
                            <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{review.profiles?.full_name ?? 'Anonymous'}</p>
                                        <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} fill={i < review.rating ? "currentColor" : "none"} />))}</div>
                                    </div>
                                    <p className="mt-2 text-gray-600 text-sm">{review.comment}</p>
                                    <p className="mt-2 text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                            </div>
                        ) : (<p className="text-sm text-gray-500">No reviews yet. Be the first to leave one!</p>)}
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default ServicePageContent;