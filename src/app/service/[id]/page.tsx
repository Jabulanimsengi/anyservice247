// src/app/service/[id]/page.tsx
'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import LeaveReview from '@/components/LeaveReview';
import { User } from '@supabase/supabase-js';
import { Star } from 'lucide-react';

// --- Type Definitions ---
type Service = {
  title: string;
  price: number;
  description: string;
  user_id: string;
  profiles: { full_name: string; } | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string; } | null;
};

interface ServiceDetailPageProps {
  params: Promise<{ id: string; }>;
}

const ServiceDetailPage = ({ params }: ServiceDetailPageProps) => {
  const { id } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`*, profiles(full_name)`)
      .eq('service_id', id)
      .eq('is_approved', true) // <-- Only fetch approved reviews
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching reviews:', error);
    else setReviews(data || []);
  }, [id]);

  const handleBookNow = async () => {
    setBookingMessage(null);
    setBookingError(null);

    if (!user) {
      setBookingError('You must be logged in to book a service.');
      return;
    }
    if (!service) {
        setBookingError('Service details are not available.');
        return;
    }
    if (user.id === service.user_id) {
        setBookingError('You cannot book your own service.');
        return;
    }

    const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: parseInt(id),
        provider_id: service.user_id,
    });

    if (error) {
        setBookingError(`Failed to create booking: ${error.message}`);
    } else {
        setBookingMessage('Booking request sent successfully! The provider will confirm shortly.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select(`*, profiles(full_name)`)
        .eq('id', id)
        .single();
      
      if (serviceError) console.error('Error fetching service:', serviceError);
      else setService(serviceData);
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      await fetchReviews();

      if (user && serviceData) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', serviceData.id)
          .eq('status', 'completed')
          .limit(1);

        const { data: reviewData } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('service_id', serviceData.id)
            .limit(1);

        if (bookingData && bookingData.length > 0 && reviewData && reviewData.length === 0) {
          setCanLeaveReview(true);
        } else {
          setCanLeaveReview(false);
        }
      }
      setLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id, fetchReviews]);
  
  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!service) return <div className="text-center py-12">Service not found.</div>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold">{service.title}</h1>
        <p className="mt-2 text-lg text-gray-500">
          by <a href="#" className="font-semibold text-blue-500">{service.profiles?.full_name ?? 'Anonymous'}</a>
        </p>
        <div className="my-6 border-t"></div>
        <div className="mb-6">
          <span className="text-3xl font-bold">R{Number(service.price).toFixed(2)}</span>
        </div>
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold">About this service</h2>
          <p>{service.description || 'No description provided.'}</p>
        </div>
        <div className="mt-8">
          <Button size="lg" onClick={handleBookNow}>Book Now</Button>
          {bookingMessage && <p className="mt-2 text-sm text-green-600">{bookingMessage}</p>}
          {bookingError && <p className="mt-2 text-sm text-red-600">{bookingError}</p>}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Reviews</h2>
        
        {canLeaveReview && (
            <LeaveReview serviceId={id} userId={user!.id} onReviewSubmitted={fetchReviews} />
        )}
        
        <div className="mt-6 space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.profiles?.full_name ?? 'Anonymous'}</p>
                  <div className="flex items-center">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400" fill="currentColor" />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-gray-300" />
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