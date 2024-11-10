// src/app/api/events/search/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { redis } from '@/lib/redis';

interface Event {
  id: string;
  title: string;
  // ... other event fields ...
  platform: string;
}

interface CachedData {
  events: Event[];
  hasMore: boolean;
  total: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("event") || "";
    const location = searchParams.get("location") || "";
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");
    
    const cacheKey = `events:${searchQuery}:${location}:${skip}:${limit}`;
    console.log('Checking cache for key:', cacheKey);

    // Try to get cached results first
    const cachedData = await redis.get<CachedData>(cacheKey);
    if (cachedData) {
      console.log('🎯 Cache HIT! Returning cached data for:', cacheKey);
      return NextResponse.json({
        ...cachedData,
        fromCache: true
      });
    }

    console.log('❌ Cache MISS! Fetching fresh data for:', cacheKey);

    // If no cache, fetch from API
    const params = {
      keywords: searchQuery.replace(/\s+/g, '+'),
      location: location,
      max_events: (skip + limit).toString()
    };

    const response = await axios.get(`${process.env.EVENTS_API_URL}/events/`, {
      params,
      headers: {
        'Accept': 'application/json',
      }
    });

    const allEvents = response.data || [];
    const eventsWithPlatform = allEvents.map((event: any) => ({
      ...event,
      ...(event.platform && { platform: event.platform })
    }));
    
    // Sort events by date (closest first)
    const sortedEvents = eventsWithPlatform.sort((a: any, b: any) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    const paginatedEvents = sortedEvents.slice(skip, skip + limit);
    const totalEvents = sortedEvents.length;
    const hasMore = skip + limit < totalEvents;

    const responseData: CachedData = {
      events: paginatedEvents,
      hasMore,
      total: totalEvents
    };

    // Cache the results
    await redis.set(cacheKey, responseData, { ex: 300 }); // Cache for 5 minutes
    console.log('✅ Cached new data for:', cacheKey);

    return NextResponse.json({
      ...responseData,
      fromCache: false
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error fetching data", details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
