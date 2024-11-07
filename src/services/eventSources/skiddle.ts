import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

interface ScrapedEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  venue: string
  town: string
  imageUrl: string
  price: number
  link: string
  latitude?: number
  longitude?: number
}

export async function scrapeSkiddleEvents() {
  try {
    console.log('Starting Skiddle scrape...')
    const events: ScrapedEvent[] = []
    
    // Scrape multiple pages
    for (let page = 1; page <= 5; page++) {
      const url = `https://www.skiddle.com/whats-on/clubs/?page=${page}`
      
      // Add random delay between requests
      await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000))
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      const $ = cheerio.load(data)
      
      // Find all event cards
      $('.event-list-item').each((_, element) => {
        try {
          const $el = $(element)
          
          const id = $el.attr('data-event-id') || ''
          const title = $el.find('.event-list-item__title').text().trim()
          const description = $el.find('.event-list-item__description').text().trim()
          const venue = $el.find('.event-list-item__venue').text().trim()
          const town = $el.find('.event-list-item__location').text().trim()
          const imageUrl = $el.find('img').attr('src') || ''
          const link = 'https://www.skiddle.com' + ($el.find('a').attr('href') || '')
          
          // Parse date and time
          const dateStr = $el.find('.event-list-item__date').text().trim()
          const startDate = parseEventDate(dateStr)
          const endDate = new Date(startDate.getTime() + 6 * 60 * 60 * 1000) // Add 6 hours as default duration
          
          // Parse price
          const priceText = $el.find('.event-list-item__price').text().trim()
          const price = parsePrice(priceText)

          if (id && title && startDate) {
            events.push({
              id,
              title,
              description,
              startDate,
              endDate,
              venue,
              town,
              imageUrl,
              price,
              link
            })
          }
        } catch (err) {
          console.error('Error parsing event:', err)
        }
      })
    }

    // Save events to database
    let savedCount = 0
    for (const event of events) {
      try {
        await prisma.event.upsert({
          where: {
            slug: `skiddle-${event.id}`
          },
          update: {
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: `${event.venue}, ${event.town}`,
            latitude: event.latitude,
            longitude: event.longitude,
            link: event.link,
            imageUrl: event.imageUrl,
            price: event.price,
            eventType: 'other', // You might want to determine this from the description
            approved: true
          },
          create: {
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: `${event.venue}, ${event.town}`,
            latitude: event.latitude,
            longitude: event.longitude,
            link: event.link,
            imageUrl: event.imageUrl,
            price: event.price,
            eventType: 'other',
            approved: true,
            slug: `skiddle-${event.id}`
          }
        })
        savedCount++
      } catch (err) {
        console.error('Error saving event:', event.title, err)
      }
    }

    return savedCount
  } catch (error) {
    console.error('Error scraping Skiddle:', error)
    throw error
  }
}

function parseEventDate(dateStr: string): Date {
  try {
    // Example format: "Friday 29th March 2024"
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      // Fallback parsing if the direct conversion fails
      const parts = dateStr.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})/)
      if (parts) {
        return new Date(`${parts[2]} ${parts[1]} ${parts[3]}`)
      }
      return new Date() // Return current date as fallback
    }
    return date
  } catch {
    return new Date()
  }
}

function parsePrice(priceStr: string): number {
  try {
    const match = priceStr.match(/£?(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : 0;
  } catch {
    return 0
  }
} 