// src/components/ServiceInteraction.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import LeaveReview from '@/components/LeaveReview';

type ServiceInteractionProps = {
  serviceId: string;
  serviceProviderId: string;
  onReviewSubmitted: () => void; // Function to trigger revalidation
};

const ServiceInteraction = ({ serviceId, serviceProviderId, onReviewSubmitted }: ServiceInteractionProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);

  useEffect(() => {
    const checkUserAndBookingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if the user has completed a booking for this service
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', serviceId)
          .eq('status', 'completed')
          .limit(1);

        // Check if the user has already left a review for this service
        const { data: reviewData } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('service_id', serviceId)
            .limit(1);

        // User can leave a review if they have a completed booking and have not yet left a review
        if (bookingData && bookingData.length > 0 && reviewData && reviewData.length === 0) {
          setCanLeaveReview(true);
        } else {
          setCanLeaveReview(false);
        }
      }
    };

    checkUserAndBookingStatus();
  }, [serviceId]);

  const handleBookNow = async () => {
    setBookingMessage(null);
    setBookingError(null);

    if (!user) {
      setBookingError('You must be logged in to book a service.');
      return;
    }
    if (user.id === serviceProviderId) {
        setBookingError('You cannot book your own service.');
        return;
    }

    const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: parseInt(serviceId),
        provider_id: serviceProviderId,
    });

    if (error) {
        setBookingError(`Failed to create booking: ${error.message}`);
    } else {
        setBookingMessage('Booking request sent successfully! The provider will confirm shortly.');
    }
  };

  return (
    <div>
      <div className="mt-8">
        <Button size="lg" onClick={handleBookNow}>Book Now</Button>
        {bookingMessage && <p className="mt-2 text-sm text-green-600">{bookingMessage}</p>}
        {bookingError && <p className="mt-2 text-sm text-red-600">{bookingError}</p>}
      </div>

      {canLeaveReview && user && (
        <LeaveReview serviceId={serviceId} userId={user.id} onReviewSubmitted={onReviewSubmitted} />
      )}
    </div>
  );
};

export default ServiceInteraction;