// src/components/ServicePageContent.tsx
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';
import BackButton from '@/components/BackButton';
import ServiceInteraction from '@/components/ServiceInteraction';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';

interface ServicePageContentProps {
  id: string;
}

const ServicePageContent = async ({ id }: ServicePageContentProps) => {
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {(service.image_urls && service.image_urls.length > 0) ? (
          service.image_urls.map((url: string, index: number) => (
            <div key={index} className="relative h-64 w-full">
              <Image src={url} alt={`${service.title} image ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-lg" priority={index === 0} />
            </div>
          ))
        ) : (
          <div className="relative h-64 w-full md:col-span-2">
            <Image src={'/placeholder.png'} alt={`${service.title} placeholder image`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-lg" priority={true} />
          </div>
        )}
      </div>
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold">{service.title}</h1>
        <p className="mt-2 text-lg text-gray-500">by <a href={`/provider/${service.user_id}`} className="font-semibold text-blue-500">{service.provider_name ?? 'Anonymous'}</a></p>
        <div className="my-6 border-t"></div>
        <div className="mb-6"><span className="text-3xl font-bold">R{Number(service.price).toFixed(2)}</span></div>
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold">About this service</h2>
          <p>{service.description || 'No description provided.'}</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-8">
          <ServiceInteraction serviceId={id} serviceProviderId={service.user_id} onReviewSubmitted={handleReviewSubmitted} />
          {service.provider_whatsapp && <a href={`https://wa.me/${service.provider_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 bg-green-500 text-white hover:bg-green-600">Request a Quote (WhatsApp)</a>}
        </div>
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold">Contact Provider</h3>
          <ul className="mt-4 space-y-2 text-gray-700">
            {service.provider_email && <li><strong>Email:</strong> {service.provider_email}</li>}
            {service.provider_website && <li><strong>Website:</strong> <a href={service.provider_website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{service.provider_website}</a></li>}
            {service.provider_whatsapp && <li><strong>WhatsApp:</strong> {service.provider_whatsapp}</li>}
            {service.provider_office_number && <li><strong>Office Number:</strong> {service.provider_office_number}</li>}
          </ul>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <div className="mt-6 space-y-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.profiles?.full_name ?? 'Anonymous'}</p>
                  <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} fill={i < review.rating ? "currentColor" : "none"} />))}</div>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                <p className="mt-2 text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))
          ) : (<p className="mt-4 text-gray-500">No reviews yet. Be the first to leave one!</p>)}
        </div>
      </div>
    </div>
  );
};

export default ServicePageContent;