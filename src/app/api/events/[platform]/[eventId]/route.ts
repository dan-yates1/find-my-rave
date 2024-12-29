import { NextResponse } from 'next/server';
import axios from "axios";
import { headers } from 'next/headers';

const SKIDDLE_API_BASE = "https://www.skiddle.com/api/v1";

// Add caching for the Skiddle API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { platform: string; eventId: string } }
) {
  console.log('Event details request:', params);

  try {
    if (params.platform !== 'skiddle') {
      throw new Error('Only Skiddle events are supported');
    }

    // Add more detailed logging for debugging
    console.log('Calling Skiddle API:', `${SKIDDLE_API_BASE}/events/${params.eventId}`);
    
    // Check cache first
    const cacheKey = `event-${params.platform}-${params.eventId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    // Add description=1 to get full event details
    const response = await axios.get(`${SKIDDLE_API_BASE}/events/${params.eventId}`, {
      params: {
        api_key: process.env.SKIDDLE_API_KEY,
        description: '1',
        venue: '1',
        artist: '1'
      }
    });

    console.log('Skiddle API response status:', response.status);

    const skiddleEvent = response.data.results;

    // Transform the response to match our Event type
    const event = {
      id: skiddleEvent.id,
      title: skiddleEvent.eventname,
      description: skiddleEvent.description || '',
      startDate: skiddleEvent.startdate,
      endDate: skiddleEvent.enddate || skiddleEvent.startdate,
      location: skiddleEvent.venue.name,
      town: skiddleEvent.venue.town,
      latitude: parseFloat(skiddleEvent.venue.latitude),
      longitude: parseFloat(skiddleEvent.venue.longitude),
      link: skiddleEvent.link,
      imageUrl: skiddleEvent.largeimageurl || skiddleEvent.imageurl,
      price: skiddleEvent.entryprice || 0,
      platform: 'skiddle',
      approved: true,
      artists: skiddleEvent.artists || [],
      genres: skiddleEvent.genres || [],
      minAge: skiddleEvent.MinAge || null,
      venue: {
        name: skiddleEvent.venue.name,
        town: skiddleEvent.venue.town,
        postcode: skiddleEvent.venue.postcode,
        country: skiddleEvent.venue.country,
        phone: skiddleEvent.venue.phone,
        website: skiddleEvent.venue.webLink,
      },
      openingtimes: skiddleEvent.openingtimes || null
    };

    // Store in cache
    cache.set(cacheKey, {
      data: event,
      timestamp: Date.now()
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { 
        message: "Event not found",
        details: error.message
      },
      { status: error.response?.status || 404 }
    );
  }
} 