const { scrapeSkiddleEvents } = require('../src/services/eventSources/skiddle')

async function main() {
  try {
    console.log('Starting event sync...')
    
    const eventCount = await scrapeSkiddleEvents()
    console.log(`Successfully synced ${eventCount} events from Skiddle`)
    
  } catch (error) {
    console.error('Error syncing events:', error)
    process.exit(1)
  }
}

main() 