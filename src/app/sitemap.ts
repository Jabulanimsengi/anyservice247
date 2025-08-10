// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const siteUrl = 'https://homeservice247.vercel.app'; // Updated domain

  // Get all services
  const { data: services } = await supabase.from('services').select('id, created_at');

  // Get all products
  const { data: products } = await supabase.from('products').select('id, created_at');
  
  const serviceUrls = services?.map(({ id, created_at }) => ({
    url: `${siteUrl}/service/${id}`,
    lastModified: new Date(created_at).toISOString(),
  })) ?? [];
  
  const productUrls = products?.map(({ id, created_at }) => ({
    url: `${siteUrl}/products/${id}`,
    lastModified: new Date(created_at).toISOString(),
  })) ?? [];

  return [
    { url: siteUrl, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/about`, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/explore`, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/for-providers`, lastModified: new Date().toISOString() },
    ...serviceUrls,
    ...productUrls
  ];
}