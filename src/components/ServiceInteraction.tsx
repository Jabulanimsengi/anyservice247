// src/components/ServiceInteraction.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import LeaveReview from '@/components/LeaveReview';
import BookingCalendar from './BookingCalendar';
import { Input } from './ui/Input';
import Spinner from './ui/Spinner';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useStore } from '@/lib/store';

type ServiceInteractionProps = {
  serviceId: string;
  serviceProviderId: string;
  onReviewSubmitted: () => void;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } } | null | undefined;
};

const ServiceInteraction = ({ serviceId, serviceProviderId, onReviewSubmitted, availability }: ServiceInteractionProps) => {
  const { addToast } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);
  const [quoteDescription, setQuoteDescription] = useState('');
  const [quoteAttachments, setQuoteAttachments] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        if (quoteAttachments.length + files.length > 5) {
            addToast('You can upload a maximum of 5 images.', 'error');
            return;
        }
        setQuoteAttachments(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
      setQuoteAttachments(quoteAttachments.filter((_, index) => index !== indexToRemove));
      setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleRequestQuote = async () => {
    setIsRequesting(true);
    setBookingMessage(null);
    setBookingError(null);

    if (!user) {
      setBookingError('You must be logged in to book a service.');
      setIsRequesting(false);
      return;
    }
    if (user.id === serviceProviderId) {
        setBookingError('You cannot book your own service.');
        setIsRequesting(false);
        return;
    }
    if (userRole === 'provider' || userRole === 'admin') {
        setBookingError('Service providers cannot request quotes from other providers.');
        setIsRequesting(false);
        return;
    }
    if (!selectedDateTime) {
        setBookingError('Please select a date and time for the appointment.');
        setIsRequesting(false);
        return;
    }
    if (!quoteDescription) {
        setBookingError('Please provide a brief description of what you are looking for.');
        setIsRequesting(false);
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
                setIsRequesting(false);
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
    setIsRequesting(false);
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
            <label htmlFor="quoteAttachments" className="mb-2 block text-sm font-medium text-gray-700">Attachments (up to 5 images)</label>
            <Input
                id="quoteAttachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="pt-2"
                accept="image/*"
            />
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <Image src={preview} alt="Image preview" width={100} height={100} className="h-20 w-20 object-cover rounded-md" />
                            <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"><X size={12} /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      <div className="mt-4">
        <Button size="lg" onClick={handleRequestQuote} disabled={!selectedDateTime || !quoteDescription || isRequesting}>
          {isRequesting ? <Spinner /> : 'Request Quote'}
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