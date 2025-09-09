import { MetadataRoute } from 'next';
import { dataProvider } from '@/lib/api/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // 基本的なページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 動的ページ（カテゴリー）
  let dynamicPages: MetadataRoute.Sitemap = [];
  
  try {
    const categories = await dataProvider.getCategories();
    
    dynamicPages = categories.map((category) => ({
      url: `${baseUrl}/learning/${encodeURIComponent(category.category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn('Failed to generate dynamic sitemap entries:', error);
  }

  return [...staticPages, ...dynamicPages];
}