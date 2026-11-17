import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/result/'],
    },
    sitemap: 'https://para.layero.app/sitemap.xml',
  };
}