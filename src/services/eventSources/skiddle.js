const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()
const SKIDDLE_API_KEY = process.env.SKIDDLE_API_KEY

async function scrapeSkiddleEvents() {
  try {
    console.log('Starting Skiddle API fetch...')
    const events = []
    
    // Get events for multiple cities
    const cities = ['London', 'Manchester', 'Birmingham', 'Leeds']
    
    for (const city of cities) {
      console.log(`Fetching events for ${city}...`)
      
      const response = await axios.get('https://www.skiddle.com/api/v1/events/search', {
        params: {
          api_key: SKIDDLE_API_KEY,
          keyword: 'club',
          city: city,
          limit: 100,
          order: 'date',
          description: 1, // Include full description
          imagesize: 'medium'
        }
      })

      const apiEvents = response.data.results || []
      
      for (const event of apiEvents) {
        events.push({
          id: event.id,
          title: event.eventname,
          description: event.description || '',
          startDate: new Date(event.startdate),
          endDate: new Date(event.enddate || event.startdate),
          venue: event.venue.name,
          town: event.venue.town,
          imageUrl: event.largeimageurl || event.imageurl,
          price: parseFloat(event.entryprice) || 0,
          link: event.link,
          latitude: parseFloat(event.venue.latitude) || null,
          longitude: parseFloat(event.venue.longitude) || null,
          slug: `skiddle-${event.id}`
        })
      }
      
      // Add delay between cities to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`Found ${events.length} events, saving to database...`)

    // Upsert events to database
    for (const event of events) {
      await prisma.event.upsert({
        where: { id: event.id },
        update: event,
        create: event
      })
    }

    return events.length
    
  } catch (error) {
    console.error('Error fetching from Skiddle API:', error)
    throw error
  }
}

module.exports = { scrapeSkiddleEvents }