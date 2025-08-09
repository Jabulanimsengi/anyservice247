// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSubmitted(false);

    // This generates the reset link that points to your site's /reset-password route
    const resetUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setIsSubmitted(true);
    }
    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-gray-600">
          A password reset link has been sent to **{email}** if an account with that email exists. Please follow the instructions in the email to reset your password.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Forgot Your Password?</h1>
      <p className="mb-4 text-gray-600">
        No problem. Enter your email address below and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner /> : 'Send Reset Link'}
        </Button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;