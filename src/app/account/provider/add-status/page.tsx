// src/app/account/provider/add-status/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';

const AddStatusPage = () => {
  const router = useRouter();
  const { addToast } = useStore();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + imageFiles.length > 5) {
        addToast('You can upload a maximum of 5 images.', 'error');
        return;
      }
      setImageFiles((prevFiles) => [...prevFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles(imageFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      addToast('Please select at least one image to upload.', 'error');
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToast('You must be logged in.', 'error');
      setLoading(false);
      return;
    }

    const uploadPromises = imageFiles.map(file => {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      return supabase.storage.from('status-images').upload(fileName, file);
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls: string[] = [];
    for (const result of uploadResults) {
      if (result.error) {
        addToast(`Image upload failed: ${result.error.message}`, 'error');
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('status-images')
        .getPublicUrl(result.data.path);
      imageUrls.push(publicUrl);
    }

    const { error: insertError } = await supabase.from('status_updates').insert({
      provider_id: user.id,
      image_urls: imageUrls,
      caption: caption,
    });

    if (insertError) {
      addToast(`Failed to post status: ${insertError.message}`, 'error');
    } else {
      addToast('Status posted successfully!', 'success');
      router.push('/account/provider');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Post a New Status</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">Work Images (up to 5)</label>
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-brand-teal focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-teal focus-within:ring-offset-2 hover:text-brand-teal/80">
                  <span>Upload files</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
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

        <div>
          <label htmlFor="caption" className="mb-2 block text-sm font-medium text-gray-700">Caption (Optional)</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe the work you've done..."
            rows={3}
            className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner /> : 'Post Status'}
        </Button>
      </form>
    </div>
  );
};

export default AddStatusPage;