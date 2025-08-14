import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/e/*', '/api/*', '/(owner)/*'], // Don't index emergency pages or private areas
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Block OpenAI's GPTBot from all pages
      },
      {
        userAgent: 'CCBot',
        disallow: '/', // Block Common Crawl bot
      },
    ],
    sitemap: 'https://vitaltags.com/sitemap.xml',
  };
}