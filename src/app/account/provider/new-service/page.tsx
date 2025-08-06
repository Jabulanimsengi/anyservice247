// src/app/account/provider/new-service/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import { locationsData, provinces } from '@/lib/locations';
import { categories } from '@/lib/categories';
import { X, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Spinner from '@/components/ui/Spinner';

type ServiceLocation = {
  province: string;
  city: string;
};

type Availability = {
    [key: string]: { start: string; end: string; is24Hours: boolean };
}

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const NewServicePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [callOutFee, setCallOutFee] = useState(''); // New state for call-out fee
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [currentProvince, setCurrentProvince] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [availableForEmergencies, setAvailableForEmergencies] = useState(false);


  // State for provider details
  const [phone, setPhone] = useState('');
  const [officeNumber, setOfficeNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [availability, setAvailability] = useState<Availability>({});

  const handleAvailabilityChange = (day: string, field: 'start' | 'end' | 'is24Hours', value: string | boolean) => {
    setAvailability(prev => {
        const currentDay = prev[day] || { start: '', end: '', is24Hours: false };
        return {
            ...prev,
            [day]: {
                ...currentDay,
                [field]: value,
            }
        };
    });
  };

  const applyToAllDays = () => {
    const firstDay = availability['monday'];
    if(firstDay) {
      const newAvailability: Availability = {};
      weekDays.forEach(day => {
        newAvailability[day] = { ...firstDay };
      });
      setAvailability(newAvailability);
    }
  }

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
      if (imageFiles.length + files.length > 10) {
        setError('You can upload a maximum of 10 images.');
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
        if (removedPreview[0]) URL.revokeObjectURL(removedPreview[0]);
        return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category) { setError('Please select a service category.'); return; }
    if (locations.length === 0) { setError('Please add at least one service location.'); return; }
    
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to add a service.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone, office_number: officeNumber, whatsapp, availability })
        .eq('id', user.id);

    if(profileError) {
        setError(`Error updating profile: ${profileError.message}`);
        setLoading(false);
        return;
    }

    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('service-images').upload(fileName, file);
        if (uploadError) {
          setError(`Image upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('service-images').getPublicUrl(uploadData.path);
        imageUrls.push(publicUrl);
      }
    }

    const { data: serviceData, error: insertError } = await supabase.from('services').insert({
      user_id: user.id,
      title,
      description,
      price: parseFloat(price),
      call_out_fee: parseFloat(callOutFee) || 0, // Add call_out_fee here
      image_urls: imageUrls,
      locations: locations,
      category: category,
      status: 'pending',
      available_for_emergencies: availableForEmergencies,
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      // Notify Admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins && serviceData) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          message: `A new service "${title}" has been submitted for approval.`,
          link: `/admin/services`
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
            <h1 className="mt-4 text-2xl font-bold">Service Submitted!</h1>
            <p className="mt-2 text-gray-600">
                Your service listing is now awaiting admin approval. You will be notified once it has been reviewed.
            </p>
            <Button onClick={() => router.push('/account/provider')} className="mt-6">
                Back to Dashboard
            </Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Add a New Service</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        
        <div className="space-y-4 rounded-md border p-4">
            <h3 className="font-medium text-gray-800">Service Details</h3>
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
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">Service Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the service you offer..." rows={5} className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background" />
            </div>
             <div>
                <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">Price per Hour (R)</label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 450.00" required step="0.01" />
            </div>
            <div>
                <label htmlFor="callOutFee" className="mb-2 block text-sm font-medium text-gray-700">Call-Out Fee (R) (Optional)</label>
                <Input id="callOutFee" type="number" value={callOutFee} onChange={(e) => setCallOutFee(e.target.value)} placeholder="e.g., 150.00" step="0.01" />
            </div>
             <div className="flex items-center">
                <input
                    id="emergency"
                    type="checkbox"
                    checked={availableForEmergencies}
                    onChange={(e) => setAvailableForEmergencies(e.target.checked)}
                    className="h-4 w-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                />
                <label htmlFor="emergency" className="ml-2 block text-sm font-medium text-gray-700">Available for urgent services</label>
            </div>
        </div>

        <div className="space-y-4 rounded-md border p-4">
            <h3 className="font-medium text-gray-800">Your Contact Details</h3>
             <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">Mobile Phone</label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 082 123 4567" />
            </div>
             <div>
                <label htmlFor="officeNumber" className="mb-2 block text-sm font-medium text-gray-700">Office Number</label>
                <Input id="officeNumber" type="tel" value={officeNumber} onChange={(e) => setOfficeNumber(e.target.value)} placeholder="e.g., 011 123 4567" />
            </div>
             <div>
                <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g., 082 123 4567" />
            </div>
        </div>

        <div className="space-y-4 rounded-md border p-4">
             <h3 className="font-medium text-gray-800">Your Weekly Availability</h3>
             <Button type="button" variant="outline" onClick={applyToAllDays} className="w-full">Apply to all days</Button>
             {weekDays.map(day => (
                 <div key={day} className="grid grid-cols-4 items-center gap-4">
                     <label htmlFor={day} className="capitalize text-sm font-medium">{day}</label>
                     <Input type="time" id={`${day}-start`} value={availability[day]?.start || ''} onChange={e => handleAvailabilityChange(day, 'start', e.target.value)} disabled={availability[day]?.is24Hours}/>
                     <Input type="time" id={`${day}-end`} value={availability[day]?.end || ''} onChange={e => handleAvailabilityChange(day, 'end', e.target.value)} disabled={availability[day]?.is24Hours}/>
                      <div>
                        <input type="checkbox" id={`${day}-24hours`} checked={availability[day]?.is24Hours || false} onChange={e => handleAvailabilityChange(day, 'is24Hours', e.target.checked)} />
                        <label htmlFor={`${day}-24hours`} className="ml-2 text-sm">24 hours</label>
                      </div>
                 </div>
             ))}
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">Service Images (up to 10)</label>
          <Input id="image" type="file" onChange={handleFileChange} accept="image/*" multiple className="pt-2" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={preview} className="relative">
                <Image src={preview} alt={`Preview ${index + 1}`} width={150} height={150} className="w-full h-32 object-cover rounded-md" />
                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={16} /></button>
              </div>
            ))}
          </div>
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner /> : 'Submit for Approval'}
        </Button>
      </form>
    </div>
  );
};

export default NewServicePage;