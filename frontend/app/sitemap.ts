import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://slza.sk/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: 'https://slza.sk/produkty',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: 'https://slza.sk/kontakt',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: 'https://slza.sk/kosik',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    }
  ];
}
