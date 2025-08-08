// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://www.homeservice247.co.za'; // Replace with your actual domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}