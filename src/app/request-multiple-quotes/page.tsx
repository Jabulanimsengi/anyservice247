// src/app/request-multiple-quotes/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import { categories } from '@/lib/categories';
import { locationsData, provinces } from '@/lib/locations';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { X, CheckCircle } from 'lucide-react';

const RequestMultipleQuotesPage = () => {
    const router = useRouter();
    const { addToast } = useStore();
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (attachments.length + files.length > 5) {
                addToast('You can upload a maximum of 5 images.', 'error');
                return;
            }
            setAttachments(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setAttachments(attachments.filter((_, index) => index !== indexToRemove));
        setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!category || !description || !selectedProvince || !selectedCity) {
            addToast('Please fill out all fields, including category, description, and location.', 'error');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            addToast('You must be logged in to request quotes.', 'error');
            setLoading(false);
            return;
        }

        const attachmentUrls: string[] = [];
        if (attachments.length > 0) {
            for (const file of attachments) {
                const fileName = `${user.id}/${Date.now()}_${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('quote-attachments')
                    .upload(fileName, file);

                if (uploadError) {
                    addToast(`Attachment upload failed: ${uploadError.message}`, 'error');
                    setLoading(false);
                    return;
                }
                const { data: { publicUrl } } = supabase.storage.from('quote-attachments').getPublicUrl(uploadData.path);
                attachmentUrls.push(publicUrl);
            }
        }

        const { error } = await supabase.from('multiple_quote_requests').insert({
            user_id: user.id,
            category,
            description,
            attachments: attachmentUrls,
            status: 'pending',
            province: selectedProvince,
            city: selectedCity,
        });

        if (error) {
            addToast(`Failed to submit request: ${error.message}`, 'error');
            setLoading(false);
        } else {
            // Notify Admins
            const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
            if (admins) {
                const notifications = admins.map(admin => ({
                    user_id: admin.id,
                    message: `A new multiple quote request for "${category}" is awaiting approval.`,
                    link: '/admin/multiple-quote-requests'
                }));
                await supabase.from('notifications').insert(notifications);
            }
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-2xl font-bold">Request Submitted!</h1>
                <p className="mt-2 text-gray-600">
                    Your request is now awaiting admin approval. You will be notified once it has been reviewed and sent to providers.
                </p>
                <Button onClick={() => router.push('/account/bookings')} className="mt-6">
                    View My Bookings
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Request Multiple Quotes</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
                <div>
                    <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background"
                    >
                        <option value="" disabled>Select a category...</option>
                        {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                {/* --- LOCATION SELECTORS --- */}
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

                <div>
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide a detailed description of the work you need done."
                        rows={5}
                        required
                        className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background"
                    />
                </div>
                <div>
                    <label htmlFor="attachments" className="mb-2 block text-sm font-medium text-gray-700">Attachments (up to 5 images)</label>
                    <Input
                        id="attachments"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                        className="pt-2"
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
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Spinner /> : 'Submit Request'}
                </Button>
            </form>
        </div>
    );
};

export default RequestMultipleQuotesPage;