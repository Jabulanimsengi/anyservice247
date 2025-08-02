// src/components/ServicePageContent.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { Star, Phone, MessageCircle, Building, MapPin } from 'lucide-react';
import BackButton from '@/components/BackButton';
import ServiceInteraction from '@/components/ServiceInteraction';
import { revalidatePath } from 'next/cache';
import ImageGallery from './ImageGallery';
import Link from 'next/link';
import MessageProviderButton from './MessageProviderButton';
import WhatsAppButton from './WhatsAppButton';

const maskNumber = (number: string | null) => {
    if (!number) return 'Not Provided';
    return number.substring(0, 4) + '... (Sign in to view)';
}

const ServicePageContent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const supabase = await createClient(); // Await the createClient function

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const { data: service, error: serviceError } = await supabase
    .from('service_with_ratings')
    .select(`*, profiles ( phone, office_number, whatsapp, availability )`)
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

  const handleReviewSubmitted = async () => { 'use server'; revalidatePath(`/service/${id}`); };

  const providerProfile = service.profiles;

  return (
    <div className="bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <BackButton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-4">
                <ImageGallery imageUrls={service.image_urls} itemName={service.title} />
                <div className="flex flex-col">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{service.title}</h1>
                    <p className="mt-1 text-lg">by <Link href={`/provider/${service.user_id}`} className="font-semibold text-blue-600 hover:underline">{service.provider_name ?? 'Anonymous'}</Link></p>
                    <div className="my-6 border-t"></div>
                    <div className="mb-6">
                        <span className="text-gray-500">from </span>
                        <span className="text-4xl font-bold text-gray-900">R{Number(service.price).toFixed(2)}/hr</span>
                        {service.call_out_fee > 0 && (
                            <p className="text-sm text-gray-600 mt-2">Call-out fee: R{Number(service.call_out_fee).toFixed(2)}</p>
                        )}
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
                    
                    <ServiceInteraction serviceId={id} serviceProviderId={service.user_id} onReviewSubmitted={handleReviewSubmitted} />

                    <div className="flex flex-wrap gap-2 mt-4">
                        <MessageProviderButton
                            providerId={service.user_id}
                            providerName={service.provider_name ?? 'Anonymous'}
                            user={user ?? null}
                        />
                        {providerProfile?.whatsapp && (
                           <WhatsAppButton isLoggedIn={isLoggedIn} whatsappNumber={providerProfile.whatsapp} />
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 border-t pt-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Contact Provider</h3>
                        {providerProfile ? (
                             <ul className="space-y-3 text-gray-700">
                                <li className="flex items-center"><Phone size={20} className="mr-3 text-gray-500"/>{isLoggedIn ? providerProfile.phone || 'Not Provided' : maskNumber(providerProfile.phone)}</li>
                                <li className="flex items-center"><Building size={20} className="mr-3 text-gray-500"/>{isLoggedIn ? providerProfile.office_number || 'Not Provided' : maskNumber(providerProfile.office_number)}</li>
                                <li className="flex items-center"><MessageCircle size={20} className="mr-3 text-green-500"/> 
                                {isLoggedIn && providerProfile.whatsapp ? (
                                    <a href={`https://wa.me/${providerProfile.whatsapp.replace(/[^0-9]/g, '')}`} className="text-green-600 hover:underline">{providerProfile.whatsapp}</a>
                                ) : (
                                    <span>{isLoggedIn ? 'Not Provided' : maskNumber(providerProfile.whatsapp)}</span>
                                )}
                                </li>
                            </ul>
                        ) : <p className="text-sm text-gray-500">Contact details not provided.</p>}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Availability</h2>
                        {providerProfile?.availability ? (
                            <div className="space-y-2 text-sm">
                                {Object.entries(providerProfile.availability).map(([day, times]: any) => (
                                    (times.start && times.end) &&
                                    <div key={day} className="grid grid-cols-3">
                                        <span className="font-semibold capitalize">{day}</span>
                                        <span>{times.start} - {times.end}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">Availability not specified.</p>}
                    </div>
                 </div>
            </div>
            
             <div className="mt-12 border-t pt-8" id="reviews">
                <h2 className="text-2xl font-bold">Reviews</h2>
                 {reviews && reviews.length > 0 ? (
                    reviews.map((review: any) => (
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
  );
};

export default ServicePageContent;