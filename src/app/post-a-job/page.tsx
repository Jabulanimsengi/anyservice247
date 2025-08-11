// src/app/post-a-job/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';
import { CheckCircle } from 'lucide-react';
import { locationsData, provinces } from '@/lib/locations';

const PostAJobPage = () => {
    const router = useRouter();
    const { addToast } = useStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [duration, setDuration] = useState('1');
    const [durationUnit, setDurationUnit] = useState<'hours' | 'days' | 'minutes'>('days');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title || !description || !selectedProvince || !selectedCity || !budget) {
            addToast('Please fill out all required fields.', 'error');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            addToast('You must be logged in to post a job.', 'error');
            setLoading(false);
            return;
        }

        const now = new Date();
        let expiresAt = new Date(now);
        const durationValue = parseInt(duration, 10);

        if (durationUnit === 'minutes') {
            expiresAt.setMinutes(now.getMinutes() + durationValue);
        } else if (durationUnit === 'hours') {
            expiresAt.setHours(now.getHours() + durationValue);
        } else if (durationUnit === 'days') {
            expiresAt.setDate(now.getDate() + durationValue);
        }

        const { error } = await supabase.from('job_posts').insert({
            user_id: user.id,
            title,
            description,
            location: { province: selectedProvince, city: selectedCity },
            budget: parseFloat(budget),
            expires_at: expiresAt.toISOString(),
            status: 'open'
        });

        if (error) {
            addToast(`Failed to submit job post: ${error.message}`, 'error');
            setLoading(false);
        } else {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-2xl font-bold">Job Posted Successfully!</h1>
                <p className="mt-2 text-gray-600">
                    Your job is now live. Service providers in your area can now view and submit quotes for your request.
                </p>
                <Button onClick={() => router.push('/jobs')} className="mt-6">
                    View Job Posts
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Post a Job</h1>
            <p className="mb-6 text-gray-600">Describe what you need done, and let verified local professionals send you quotes.</p>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
                <div>
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">What do you need?</label>
                    <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Fix a leaking kitchen tap" required />
                </div>

                <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide as much detail as possible. What is the problem? What have you tried?"
                        rows={6}
                        required
                        className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="province-filter" className="mb-2 block text-sm font-medium text-gray-700">Province</label>
                        <select id="province-filter" value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(''); }} required className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background">
                            <option value="">Select Province</option>
                            {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="city-filter" className="mb-2 block text-sm font-medium text-gray-700">City</label>
                        <select id="city-filter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} required className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background disabled:bg-gray-100">
                            <option value="">Select City</option>
                            {selectedProvince && locationsData[selectedProvince].map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="budget" className="mb-2 block text-sm font-medium text-gray-700">Your Budget (R)</label>
                        <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 500" required step="0.01" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Post Duration</label>
                        <div className="flex gap-2">
                            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required min="1" className="w-1/3" />
                            <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as any)} className="w-2/3 block rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background">
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full !mt-8">
                    {loading ? <Spinner /> : 'Post Your Job'}
                </Button>
            </form>
        </div>
    );
};

export default PostAJobPage;