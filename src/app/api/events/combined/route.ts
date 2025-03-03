import { NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { GENRE_MAPPINGS, SKIDDLE_GENRE_MAPPING, SKIDDLE_GENRE_IDS } from '@/lib/constants';
import { getLatLon } from "@/lib/utils";

const SKIDDLE_API_BASE = "https://www.skiddle.com/api/v1";

const searchParamsSchema = z.object({
  event: z.string().optional(),
  location: z.string().optional(),
  skip: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  platform: z.string().optional(),
  dateRange: z.string().optional(),
  customDate: z.string().optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  order: z.string().optional(),
  genre: z.string().optional(),
});

// First, let's create a mapping of our genres to Skiddle genre IDs
const GENRE_TO_SKIDDLE_IDS: Record<string, string[]> = {
  house: ['1', '10', '14', '22', '102', '108'], // House genres
  techno: ['9', '111'], // Techno and Minimal
  dnb: ['8', '80'], // DnB and Jungle
  trance: ['2', '17', '28'], // Trance variants
  dubstep: ['65'], // Dubstep
  garage: ['3'], // UK Garage
  hardstyle: ['18', '81'], // Hardstyle/Hardcore
  electronic: ['61', '79'], // General electronic/EDM
} as const;

interface SkiddleGenre {
  genreid: string;
  name: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const validatedParams = searchParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(validatedParams.limit || 12, 24);
    const genre = searchParams.get('genre');
    const location = validatedParams.location;
    
    // Calculate the correct offset based on the page
    const offset = (page - 1) * limit;

    // Only fetch from Skiddle API
    const skiddleEvents = await fetchSkiddleEvents(validatedParams, page, limit, genre, location);
    
    // Log pagination info for debugging
    console.log("API Pagination:", {
      currentPage: page,
      totalPages: skiddleEvents.pagination.totalPages,
      totalResults: skiddleEvents.pagination.totalResults,
      hasMore: page < skiddleEvents.pagination.totalPages
    });
    
    return NextResponse.json({
      events: skiddleEvents.events,
      pagination: {
        currentPage: page,
        totalPages: skiddleEvents.pagination.totalPages,
        totalResults: skiddleEvents.pagination.totalResults,
        hasMore: page < skiddleEvents.pagination.totalPages
      }
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Error fetching events" },
      { status: 500 }
    );
  }
}

// Helper function to fetch events from Skiddle API
async function fetchSkiddleEvents(
  validatedParams: z.infer<typeof searchParamsSchema>,
  page: number,
  limit: number,
  genre: string | null,
  location: string | undefined
) {
  // For genre filtering, we might need to fetch more events
  const fetchLimit = genre && genre !== 'all' ? limit * 2 : limit;
  const offset = (page - 1) * limit;

  let params = new URLSearchParams({
    api_key: process.env.SKIDDLE_API_KEY!,
    offset: offset.toString(),
    limit: fetchLimit.toString(),
    order: validatedParams.order || 'trending',
    description: '1',
    ticketsavailable: '1',
  });

  // Handle keyword (event name)
  if (validatedParams.event) {
    params.append('keyword', validatedParams.event);
  }

  // Handle location search
  if (location) {
    params.append('keyword', location);
    params.append('radius', '20');
    params.append('geodist', '1');
  }

  // Handle date filtering
  if (validatedParams.minDate) {
    params.append('minDate', validatedParams.minDate);
  }

  if (validatedParams.maxDate) {
    params.append('maxDate', validatedParams.maxDate);
  }

  // Handle date range filtering
  if (validatedParams.dateRange && validatedParams.dateRange !== 'all' && validatedParams.dateRange !== 'custom') {
    const today = new Date();
    
    switch (validatedParams.dateRange) {
      case 'today':
        const todayFormatted = today.toISOString().split('T')[0];
        params.append('minDate', todayFormatted);
        params.append('maxDate', todayFormatted);
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
        params.append('minDate', tomorrowFormatted);
        params.append('maxDate', tomorrowFormatted);
        break;
      case 'this-week':
        const endOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysUntilEndOfWeek = 6 - dayOfWeek; // 6 = Saturday
        endOfWeek.setDate(today.getDate() + daysUntilEndOfWeek);
        params.append('minDate', today.toISOString().split('T')[0]);
        params.append('maxDate', endOfWeek.toISOString().split('T')[0]);
        break;
      case 'weekend':
        const nextFriday = new Date(today);
        const daysUntilFriday = (5 - today.getDay() + 7) % 7; // 5 = Friday
        nextFriday.setDate(today.getDate() + daysUntilFriday);
        
        const nextSunday = new Date(nextFriday);
        nextSunday.setDate(nextFriday.getDate() + 2); // Sunday is 2 days after Friday
        
        params.append('minDate', nextFriday.toISOString().split('T')[0]);
        params.append('maxDate', nextSunday.toISOString().split('T')[0]);
        break;
    }
  }

  // Handle custom date if provided
  if (validatedParams.customDate && validatedParams.dateRange === 'custom') {
    params.append('minDate', validatedParams.customDate);
    params.append('maxDate', validatedParams.customDate);
  }

  console.log(`Fetching Skiddle events - page: ${page}, limit: ${limit}, offset: ${offset}`);
  const response = await axios.get(`${SKIDDLE_API_BASE}/events/search?${params.toString()}`);
  console.log(`Skiddle API returned ${response.data.results.length} events, total: ${response.data.totalcount}`);
  
  let filteredEvents = response.data.results;
  let totalCount = parseInt(response.data.totalcount);
  
  // Apply genre filtering if needed
  if (genre && genre !== 'all') {
    filteredEvents = response.data.results.filter((event: any) => 
      event.genres?.some((eventGenre: { genreid: string }) => 
        GENRE_TO_SKIDDLE_IDS[genre as keyof typeof GENRE_TO_SKIDDLE_IDS]?.includes(eventGenre.genreid)
      )
    );
    
    console.log(`After genre filtering: ${filteredEvents.length} events match genre: ${genre}`);
    
    // If we don't have enough events for this page and there are more available, fetch another batch
    if (filteredEvents.length < limit && page === 1 && parseInt(response.data.totalcount) > fetchLimit) {
      console.log(`Fetching additional events for genre filtering`);
      const nextBatch = await axios.get(`${SKIDDLE_API_BASE}/events/search?${new URLSearchParams({
        ...Object.fromEntries(params),
        offset: fetchLimit.toString(),
        limit: fetchLimit.toString(),
      }).toString()}`);

      const additionalEvents = nextBatch.data.results.filter((event: any) => 
        event.genres?.some((eventGenre: { genreid: string }) => 
          GENRE_TO_SKIDDLE_IDS[genre as keyof typeof GENRE_TO_SKIDDLE_IDS]?.includes(eventGenre.genreid)
        )
      );

      console.log(`Additional batch returned ${additionalEvents.length} matching events`);
      filteredEvents = [...filteredEvents, ...additionalEvents];
    }
    
    // For genre filtering, we need to calculate pagination differently
    // We need to estimate the total count based on the ratio of matching events
    const matchRatio = filteredEvents.length / response.data.results.length;
    totalCount = Math.ceil(parseInt(response.data.totalcount) * matchRatio);
    console.log(`Estimated total count for genre ${genre}: ${totalCount} events`);
    
    // For pages beyond the first, we need to calculate the correct slice
    if (page > 1) {
      const startIndex = (page - 1) * limit - offset;
      filteredEvents = filteredEvents.slice(startIndex, startIndex + limit);
    } else {
      // For the first page, just take the first 'limit' events
      filteredEvents = filteredEvents.slice(0, limit);
    }
  }

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  
  console.log(`Returning page ${page} of ${totalPages}, with ${filteredEvents.length} events`);
  
  return {
    events: filteredEvents.map((event: any) => ({
      id: event.id,
      title: event.eventname,
      description: event.description || '',
      startDate: event.startdate,
      endDate: event.enddate || event.startdate,
      location: event.venue.name,
      town: event.venue.town,
      latitude: parseFloat(event.venue.latitude),
      longitude: parseFloat(event.venue.longitude),
      imageUrl: event.largeimageurl || event.imageurl,
      minAge: event.MinAge || null,
      entryPrice: event.entryprice || null,
      genres: event.genres || [],
      link: event.link || null,
      platform: 'skiddle'
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalResults: totalCount,
      hasMore: page < totalPages
    }
  };
}
