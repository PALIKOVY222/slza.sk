import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://slza.sk';
  const currentDate = new Date();
  
  // Hlavné stránky
  const mainPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1
    },
    {
      url: `${baseUrl}/produkty`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/kosik`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3
    }
  ];

  // Produktové stránky
  const products = [
    'baner',
    'nalepky',
    'peciatky',
    'vizitky',
    'letaky',
    'plagaty',
    'kalendare',
    'fotografie',
    'bloky',
    'knihy',
    'katalogy',
    'pozvanky',
    'diplomove-prace',
    'ine'
  ];

  const productPages = products.map(slug => ({
    url: `${baseUrl}/produkt/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  return [...mainPages, ...productPages];
}
