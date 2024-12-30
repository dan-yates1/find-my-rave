import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all events from the last month
  const events = await prisma.event.findMany({
    where: {
      startDate: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      platform: true,
      updatedAt: true,
    },
  })

  const eventUrls = events.map((event) => ({
    url: `https://findmyrave.vercel.app/events/${event.platform}/${event.id}`,
    lastModified: event.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://findmyrave.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://findmyrave.vercel.app/find-events',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...eventUrls,
  ]
} 