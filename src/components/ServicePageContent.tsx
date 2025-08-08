// src/components/ServicePageContent.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { Star, MapPin } from 'lucide-react';
import BackButton from '@/components/BackButton';
import ServiceInteraction from '@/components/ServiceInteraction';
import { revalidatePath } from 'next/cache';
import ImageGallery from './ImageGallery';
import Link from 'next/link';
import MessageProviderButton from './MessageProviderButton';
import ReportButton from './ReportButton';
import CategoryRow from './CategoryRow';
import { notFound } from 'next/navigation';

type ServiceSchema = {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    image?: string;
    provider: {
        '@type': string;
        name: string;
    };
    areaServed?: {
        '@type': string;
        name: string;
    };
    aggregateRating?: {
        '@type': string;
        ratingValue: number;
        reviewCount: number;
    };
    offers?: {
        '@type': string;
        price: number;
        priceCurrency: string;
    };
};


const ServicePageContent = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // --- THIS IS THE FIX FOR THE 404 ERROR ---
  // Call the new RPC function to get a single service
  const { data: services, error: serviceError } = await supabase
    .rpc('get_service_by_id', {
        service_id_param: parseInt(id)
    });
  
  const service = services?.[0]; // Get the first item from the returned array

  if (serviceError || !service) {
    console.error(`Error or no service found for ID ${id}:`, serviceError?.message);
    notFound();
  }
  
  const { data: recommendedServices } = await supabase
    .from('service_with_ratings')
    .select('*, profiles(business_name)')
    .eq('category', service.category)
    .neq('id', service.id)
    .limit(20);
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`*, profiles(full_name)`)
    .eq('service_id', id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const handleReviewSubmitted = async () => { 'use server'; revalidatePath(`/service/${id}`); };

  const providerProfile = service.profiles as { phone: string; office_number: string; whatsapp: string; availability: { [key: string]: { start: string; end: string; is24Hours: boolean } }; business_name: string; } | null

  const serviceSchema: ServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description || '',
    provider: {
        '@type': 'LocalBusiness',
        name: providerProfile?.business_name || service.provider_name || 'HomeService24/7 Provider',
    },
  };
  if (service.image_urls && service.image_urls.length > 0) {
      serviceSchema.image = service.image_urls[0];
  }
  if (service.locations && service.locations.length > 0) {
    serviceSchema.areaServed = {
        '@type': 'City',
        name: service.locations[0].city,
    };
  }
  if (service.review_count > 0) {
    serviceSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: service.average_rating,
        reviewCount: service.review_count,
    };
  }
  if (service.price > 0) {
    serviceSchema.offers = {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'ZAR',
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <div className="bg-white">
          <div className="container mx-auto max-w-6xl px-4 py-8">
              <BackButton />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-4">
                  <ImageGallery imageUrls={service.image_urls} itemName={service.title} />
                  <div className="flex flex-col">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{service.title}</h1>
                      <p className="mt-1 text-lg">by <Link href={`/provider/${service.user_id}`} className="font-semibold text-blue-600 hover:underline">{(providerProfile?.business_name || service.provider_name) ?? 'Anonymous'}</Link></p>
                      <div className="my-6 border-t"></div>
                      
                      <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                          <h3 className="text-xl font-semibold mb-2">Applicable Fees</h3>
                          <div className="space-y-2">
                              <div className="flex justify-between items-baseline">
                                  <span className="text-gray-600">Hourly Rate (from)</span>
                                  <span className="text-2xl font-bold text-gray-900">R{Number(service.price).toFixed(2)}</span>
                              </div>
                              {service.call_out_fee > 0 && (
                                  <div className="flex justify-between items-baseline">
                                      <span className="text-gray-600">Call-Out Fee</span>
                                      <span className="text-lg font-semibold text-gray-800">R{Number(service.call_out_fee).toFixed(2)}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="prose max-w-none mb-4">
                          <h2 className="text-xl font-semibold">About this service</h2>
                          <p>{service.description || 'No description provided.'}</p>
                      </div>

                      {service.locations && service.locations.length > 0 && (
                          <div className="mb-6">
                              <h3 className="text-xl font-semibold mb-2">Service Areas</h3>
                              <div className="flex flex-wrap gap-2">
                                  {service.locations.map((loc: {city: string, province: string}, index: number) => (
                                      <div key={`${loc.city}-${index}`} className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                          <MapPin size={14} className="mr-2" />
                                          {loc.city}, {loc.province}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                      
                      <ServiceInteraction 
                        serviceId={id} 
                        serviceProviderId={service.user_id} 
                        onReviewSubmitted={handleReviewSubmitted}
                        availability={providerProfile?.availability}
                      />

                      <div className="flex flex-wrap gap-2 mt-4">
                          <MessageProviderButton providerId={service.user_id} providerName={service.provider_name ?? 'Anonymous'} user={user ?? null} />
                          <ReportButton serviceId={parseInt(id)} isLoggedIn={isLoggedIn} />
                      </div>

                      <div className="mt-8 border-t pt-6">
                          <h2 className="text-2xl font-bold mb-4">Availability</h2>
                          {providerProfile?.availability ? (
                              <div className="space-y-2 text-sm">
                                  {Object.entries(providerProfile.availability).map(([day, times]) => (
                                      (times.start && times.end || times.is24Hours) &&
                                      <div key={day} className="grid grid-cols-3">
                                          <span className="font-semibold capitalize">{day}</span>
                                          <span>{times.is24Hours ? '24 hours' : `${times.start} - ${times.end}`}</span>
                                      </div>
                                  ))}
                              </div>
                          ) : <p className="text-sm text-gray-500">Availability not specified.</p>}
                      </div>
                      
                      <div className="mt-8 border-t pt-6" id="reviews">
                          <h2 className="text-2xl font-bold">Reviews</h2>
                          {reviews && reviews.length > 0 ? (
                              reviews.map((review: { id: string; profiles: { full_name: string; }; rating: number; comment: string; created_at: string; }) => (
                              <div key={review.id} className="border-b py-4 last:border-b-0">
                                  <div className="flex items-center justify-between">
                                  <p className="font-semibold">{review.profiles?.full_name ?? 'Anonymous'}</p>
                                  <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={`star-${review.id}-${i}`} size={16} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} fill={i < review.rating ? "currentColor" : "none"} />))}</div>
                                  </div>
                                  <p className="mt-2 text-gray-600 text-sm">{review.comment}</p>
                                  <p className="mt-2 text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                              </div>
                              ))
                          ) : (<p className="mt-4 text-gray-500">No reviews yet. Be the first to leave one!</p>)}
                      </div>
                  </div>
              </div>
          </div>

          {recommendedServices && recommendedServices.length > 0 && (
            <div className="container mx-auto max-w-6xl px-4 py-8 mt-12 border-t">
              <CategoryRow 
                category="Other Recommended Service Providers" 
                services={recommendedServices} 
              />
            </div>
          )}
      </div>
    </>
  );
};

export default ServicePageContent;