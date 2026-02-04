import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/admin/*', '/api/admin/*', '/_next/*'],
      },
      {
        userAgent: 'GPTBot', // OpenAI
        allow: '/',
        disallow: ['/admin', '/api/admin/*'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended', // Bard/Gemini
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai', // Claude
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      }
    ],
    sitemap: 'https://slza.sk/sitemap.xml',
    host: 'https://slza.sk'
  };
}
