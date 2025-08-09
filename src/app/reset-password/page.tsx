// src/app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';

const ResetPasswordPage = () => {
    const router = useRouter();
    const { addToast } = useStore();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // This effect handles the session when the user lands on the page
    // from the password reset link.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // You could optionally handle the session here, but for resetting the password,
                // Supabase handles the session token automatically from the URL.
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            addToast('Password updated successfully! Please sign in.', 'success');
            router.push('/'); // Redirect to home page after successful reset
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto max-w-md px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">Choose a New Password</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
                <div>
                    <label htmlFor="password-new" className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                    <Input id="password-new" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Spinner /> : 'Update Password'}
                </Button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;