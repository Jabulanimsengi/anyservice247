// src/components/LeaveReview.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/Button';
import { Star } from 'lucide-react';

interface LeaveReviewProps {
  serviceId: string;
  userId: string;
  onReviewSubmitted: () => void; // A function to refetch reviews
}

const LeaveReview: React.FC<LeaveReviewProps> = ({ serviceId, userId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('reviews').insert({
      user_id: userId,
      service_id: parseInt(serviceId),
      rating,
      comment,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setRating(0);
      setComment('');
      onReviewSubmitted(); // Notify parent component to refetch
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="cursor-pointer"
              size={28}
              color={hoverRating >= star || rating >= star ? '#facc15' : '#e5e7eb'}
              fill={hoverRating >= star || rating >= star ? '#facc15' : 'none'}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
        <div>
          <label htmlFor="comment" className="sr-only">Comment</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
};

export default LeaveReview;