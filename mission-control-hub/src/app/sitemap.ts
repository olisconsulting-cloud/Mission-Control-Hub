import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mission-control-hub-flame.vercel.app'

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/api/auth/signin`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
