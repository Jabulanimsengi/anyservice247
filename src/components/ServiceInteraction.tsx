// src/components/ServiceInteraction.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import LeaveReview from '@/components/LeaveReview';
import BookingCalendar from './BookingCalendar';
import { Input } from './ui/Input';

type ServiceInteractionProps = {
  serviceId: string;
  serviceProviderId: string;
  onReviewSubmitted: () => void;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } } | null | undefined;
};

const ServiceInteraction = ({ serviceId, serviceProviderId, onReviewSubmitted, availability }: ServiceInteractionProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);
  const [quoteDescription, setQuoteDescription] = useState('');
  const [quoteAttachments, setQuoteAttachments] = useState<File[]>([]);

  useEffect(() => {
    const checkUserAndBookingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch user's role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile) setUserRole(profile.role);

        // Check if user can leave a review
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
    if (userRole === 'provider' || userRole === 'admin') {
        setBookingError('Service providers cannot request quotes from other providers.');
        return;
    }
    if (!selectedDateTime) {
        setBookingError('Please select a date and time for the appointment.');
        return;
    }
    if (!quoteDescription) {
        setBookingError('Please provide a brief description of what you are looking for.');
        return;
    }

    const attachmentUrls: string[] = [];
    if (quoteAttachments.length > 0) {
        for (const file of quoteAttachments) {
            const fileName = `${user.id}/${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('quote-attachments')
                .upload(fileName, file);

            if (uploadError) {
                setBookingError(`Attachment upload failed: ${uploadError.message}`);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('quote-attachments').getPublicUrl(uploadData.path);
            attachmentUrls.push(publicUrl);
        }
    }

    const { data: newBooking, error } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: parseInt(serviceId),
        provider_id: serviceProviderId,
        appointment_time: selectedDateTime,
        quote_description: quoteDescription,
        quote_attachments: attachmentUrls,
    }).select().single();

    if (error) {
        setBookingError(`Failed to create booking: ${error.message}`);
    } else {
        setBookingMessage('Booking request sent successfully! The provider will confirm shortly.');
        
        if (newBooking) {
            await supabase.from('notifications').insert({
                user_id: serviceProviderId,
                message: `You have a new booking request from ${user.user_metadata?.full_name || 'a client'}.`,
                link: '/account/provider/bookings'
            });
        }
    }
  };

  return (
    <div>
      <BookingCalendar availability={availability} onDateTimeSelected={setSelectedDateTime} />
       <div className="mt-4">
            <label htmlFor="quoteDescription" className="mb-2 block text-sm font-medium text-gray-700">Description</label>
            <textarea
                id="quoteDescription"
                value={quoteDescription}
                onChange={(e) => setQuoteDescription(e.target.value)}
                placeholder="Please provide a brief description of what you are looking for."
                rows={4}
                className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background"
            />
        </div>
        <div className="mt-4">
            <label htmlFor="quoteAttachments" className="mb-2 block text-sm font-medium text-gray-700">Attachments</label>
            <Input
                id="quoteAttachments"
                type="file"
                multiple
                onChange={(e) => setQuoteAttachments(Array.from(e.target.files || []))}
                className="pt-2"
            />
        </div>
      <div className="mt-4">
        <Button size="lg" onClick={handleRequestQuote} disabled={!selectedDateTime || !quoteDescription}>
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