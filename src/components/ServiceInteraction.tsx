// src/components/ServiceInteraction.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import LeaveReview from '@/components/LeaveReview';
import BookingCalendar from './BookingCalendar';

type ServiceInteractionProps = {
  serviceId: string;
  serviceProviderId: string;
  onReviewSubmitted: () => void;
};

const ServiceInteraction = ({ serviceId, serviceProviderId, onReviewSubmitted }: ServiceInteractionProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndBookingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', user.id)
          .eq('service_id', serviceId)
          .eq('status', 'completed')
          .limit(1);

        const { data: reviewData } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('service_id', serviceId)
            .limit(1);

        if (bookingData && bookingData.length > 0 && reviewData && reviewData.length === 0) {
          setCanLeaveReview(true);
        } else {
          setCanLeaveReview(false);
        }
      }
    };

    checkUserAndBookingStatus();
  }, [serviceId]);

  const handleRequestQuote = async () => {
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
    if (!selectedDateTime) {
        setBookingError('Please select a date and time for the appointment.');
        return;
    }

    const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: parseInt(serviceId),
        provider_id: serviceProviderId,
        appointment_time: selectedDateTime
    });

    if (error) {
        setBookingError(`Failed to create booking: ${error.message}`);
    } else {
        setBookingMessage('Booking request sent successfully! The provider will confirm shortly.');
    }
  };

  return (
    <div>
      <BookingCalendar providerId={serviceProviderId} onDateTimeSelected={setSelectedDateTime} />
      <div className="mt-4">
        <Button size="lg" onClick={handleRequestQuote} disabled={!selectedDateTime}>
          Request Quote
        </Button>
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