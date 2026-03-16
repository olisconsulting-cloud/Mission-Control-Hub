import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/dashboard/'] },
    ],
    sitemap: `${process.env.NEXTAUTH_URL || 'https://mission-control-hub-flame.vercel.app'}/sitemap.xml`,
  }
}
