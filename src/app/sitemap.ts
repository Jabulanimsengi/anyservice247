// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/utils/supabase/server';

// Define interfaces for your data shapes
interface Service {
  id: string;
  created_at: string;
}

interface Product {
  id: string;
  created_at: string;
}

interface Post {
  slug: string;
  created_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const siteUrl = 'https://homeservice247.vercel.app';

  // Helper function to fetch data and handle errors
  const fetchData = async <T>(tableName: string, select = 'id, created_at'): Promise<T[]> => {
    const { data, error } = await supabase.from(tableName).select(select);
    if (error) {
      console.error(`Error fetching ${tableName} for sitemap:`, error.message);
      throw error; // Throw an error to prevent a malformed sitemap
    }
    return (data as T[]) || [];
  };

  try {
    // Fetch all dynamic routes concurrently for better performance
    const [services, products, posts] = await Promise.all([
      fetchData<Service>('services'),
      fetchData<Product>('products'),
      fetchData<Post>('posts', 'slug, created_at'),
    ]);

    const serviceUrls = services.map(({ id, created_at }) => ({
      url: `${siteUrl}/service/${id}`,
      lastModified: new Date(created_at).toISOString(),
    }));

    const productUrls = products.map(({ id, created_at }) => ({
      url: `${siteUrl}/products/${id}`,
      lastModified: new Date(created_at).toISOString(),
    }));

    const postUrls = posts.map(({ slug, created_at }) => ({
        url: `${siteUrl}/blog/${slug}`,
        lastModified: new Date(created_at).toISOString(),
    }));


    // Static pages
    const staticUrls = [
      { url: siteUrl, lastModified: new Date().toISOString() },
      { url: `${siteUrl}/about`, lastModified: new Date().toISOString() },
      { url: `${siteUrl}/explore`, lastModified: new Date().toISOString() },
      { url: `${siteUrl}/for-providers`, lastModified: new Date().toISOString() },
      { url: `${siteUrl}/blog`, lastModified: new Date().toISOString() },
      { url: `${siteUrl}/academy`, lastModified: new Date().toISOString() },
      { url: `${siteUrl}/products`, lastModified: new Date().toISOString() },
    ];

    return [...staticUrls, ...serviceUrls, ...productUrls, ...postUrls];
  } catch (error) {
    console.error('A critical error occurred while generating the sitemap:', error);
    // Return a minimal sitemap on error to avoid breaking the build
    return [
        { url: siteUrl, lastModified: new Date().toISOString() },
    ];
  }
}