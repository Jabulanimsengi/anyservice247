// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const siteUrl = 'https://homeservice247.vercel.app';

  let serviceUrls: MetadataRoute.Sitemap = [];
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    // Fetch services
    const { data: services, error: servicesError } = await supabase.from('services').select('id, created_at');
    if (servicesError) {
      console.error('Error fetching services for sitemap:', servicesError.message);
    } else if (services) {
      serviceUrls = services.map(({ id, created_at }) => ({
        url: `${siteUrl}/service/${id}`,
        lastModified: new Date(created_at).toISOString(),
      }));
    }

    // Fetch products
    const { data: products, error: productsError } = await supabase.from('products').select('id, created_at');
    if (productsError) {
      console.error('Error fetching products for sitemap:', productsError.message);
    } else if (products) {
      productUrls = products.map(({ id, created_at }) => ({
        url: `${siteUrl}/products/${id}`,
        lastModified: new Date(created_at).toISOString(),
      }));
    }
  } catch (error) {
    console.error('A critical error occurred while generating the sitemap:', error);
  }

  // Always return static pages
  const staticUrls = [
    { url: siteUrl, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/about`, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/explore`, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/for-providers`, lastModified: new Date().toISOString() },
  ];

  return [...staticUrls, ...serviceUrls, ...productUrls];
}