// src/app/account/provider/new-service/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import { locationsData, provinces } from '@/lib/locations'; // Import new location data

// Define the structure for a location object
type ServiceLocation = {
  province: string;
  city: string;
};

const categories = [
  "Plumbing", "Electrical", "Carpentry", "Painting", "Gardening", 
  "Cleaning", "Appliance Repair", "Roofing", "Pest Control", "Other"
];

const NewServicePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- New Location State Management ---
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [currentProvince, setCurrentProvince] = useState('');
  const [currentCity, setCurrentCity] = useState('');

  const handleAddLocation = () => {
    if (currentProvince && currentCity) {
      const newLocation = { province: currentProvince, city: currentCity };
      // Prevent duplicate locations
      if (!locations.some(loc => loc.province === newLocation.province && loc.city === newLocation.city)) {
        setLocations([...locations, newLocation]);
      }
      setCurrentCity(''); // Reset city selection
    }
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };
  // --- End of New Location State Management ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category) {
      setError('Please select a service category.');
      return;
    }
    if (locations.length === 0) {
      setError('Please add at least one service location.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to add a service.');
      setLoading(false);
      return;
    }

    let imageUrl = null;
    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('service-images').upload(fileName, imageFile);
      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('service-images').getPublicUrl(uploadData.path);
      imageUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from('services').insert({
      user_id: user.id,
      title,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      locations: locations, // Save the array of location objects
      category: category,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/account/provider');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Add a New Service</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        {/* ... (title, category, image, description, price inputs remain the same) ... */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">Service Title</label>
          <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Professional Plumbing Services" required />
        </div>
        
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background">
            <option value="" disabled>Select a category...</option>
            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">Service Image</label>
          <Input id="image" type="file" onChange={handleFileChange} accept="image/*" className="pt-2" />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">Service Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the service you offer..." rows={5} className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background" />
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">Price (R)</label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 450.00" required step="0.01" />
        </div>

        {/* --- New Location Input Section --- */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium text-gray-800">Service Locations</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label htmlFor="province" className="text-sm">Province</label>
              <select id="province" value={currentProvince} onChange={(e) => { setCurrentProvince(e.target.value); setCurrentCity(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">Select Province</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="city" className="text-sm">City / Town</label>
              <select id="city" value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} disabled={!currentProvince} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100">
                <option value="">Select City</option>
                {currentProvince && locationsData[currentProvince].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={handleAddLocation} className="w-full">Add</Button>
            </div>
          </div>
          <ul className="space-y-2">
            {locations.map((loc, index) => (
              <li key={index} className="flex items-center justify-between rounded bg-gray-100 p-2 text-sm">
                <span>{loc.city}, {loc.province}</span>
                <button type="button" onClick={() => handleRemoveLocation(index)} className="font-bold text-red-500 hover:text-red-700">&times;</button>
              </li>
            ))}
          </ul>
        </div>
        {/* --- End of New Location Input Section --- */}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Saving...' : 'Save Service'}</Button>
      </form>
    </div>
  );
};

export default NewServicePage;