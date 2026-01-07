import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://craudiovizai.com';
  const now = new Date();

  // Core pages
  const corePages = [
    '',
    '/apps',
    '/games',
    '/javari',
    '/craiverse',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
    '/docs',
    '/support',
    '/faq',
    '/careers',
    '/press',
    '/partners',
    '/enterprise',
  ];

  // App pages
  const appPages = [
    '/apps/javari-ai',
    '/apps/watch-works',
    '/apps/logo-studio',
    '/apps/orlando-trip-deal',
    '/apps/games-hub',
    '/apps/meme-generator',
  ];

  // Legal pages
  const legalPages = [
    '/privacy',
    '/terms',
    '/cookies',
    '/dmca',
    '/accessibility',
    '/acceptable-use',
    '/refunds',
    '/ai-disclosure',
  ];

  // Combine all pages
  const allPages = [...corePages, ...appPages, ...legalPages];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : route.startsWith('/apps/') ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/apps' ? 0.9 : route.startsWith('/apps/') ? 0.8 : 0.7,
  }));
}
