// src/app/account/provider/new-service/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import { locationsData, provinces } from '@/lib/locations';
import { X } from 'lucide-react';
import Image from 'next/image';

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [currentProvince, setCurrentProvince] = useState('');
  const [currentCity, setCurrentCity] = useState('');

  const handleAddLocation = () => {
    if (currentProvince && currentCity) {
      const newLocation = { province: currentProvince, city: currentCity };
      if (!locations.some(loc => loc.province === newLocation.province && loc.city === newLocation.city)) {
        setLocations([...locations, newLocation]);
      }
      setCurrentCity('');
    }
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageFiles.length + files.length > 6) {
        setError('You can upload a maximum of 6 images.');
        return;
      }
      setImageFiles((prevFiles) => [...prevFiles, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => {
        const newPreviews = [...prevPreviews];
        const removedPreview = newPreviews.splice(index, 1);
        if (removedPreview[0]) {
            URL.revokeObjectURL(removedPreview[0]);
        }
        return newPreviews;
    });
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

    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(fileName, file);

        if (uploadError) {
          setError(`Image upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(uploadData.path);
        imageUrls.push(publicUrl);
      }
    }

    const { error: insertError } = await supabase.from('services').insert({
      user_id: user.id,
      title,
      description,
      price: parseFloat(price),
      image_urls: imageUrls,
      locations: locations,
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
          <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">Service Images (up to 6)</label>
          <Input id="image" type="file" onChange={handleFileChange} accept="image/*" multiple className="pt-2" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={preview} className="relative">
                <Image src={preview} alt={`Preview ${index + 1}`} width={150} height={150} className="w-full h-32 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">Service Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the service you offer..." rows={5} className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background" />
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">Price (R)</label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 450.00" required step="0.01" />
        </div>

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

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Saving...' : 'Save Service'}</Button>
      </form>
    </div>
  );
};

export default NewServicePage;