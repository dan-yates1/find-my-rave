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

// Add this interface at the top of the file
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

    // For genre filtering, fetch more events to ensure full pages
    const fetchLimit = genre && genre !== 'all' ? limit * 5 : limit;

    let params = new URLSearchParams({
      api_key: process.env.SKIDDLE_API_KEY!,
      offset: offset.toString(),
      limit: fetchLimit.toString(),
      order: 'trending',
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

    const response = await axios.get(`${SKIDDLE_API_BASE}/events/search?${params.toString()}`);
    
    let filteredEvents = response.data.results;
    if (genre && genre !== 'all') {
      filteredEvents = response.data.results.filter((event: any) => 
        event.genres?.some((eventGenre: { genreid: string }) => 
          GENRE_TO_SKIDDLE_IDS[genre as keyof typeof GENRE_TO_SKIDDLE_IDS]?.includes(eventGenre.genreid)
        )
      );

      // If we don't have enough events and there are more available, fetch another batch
      if (filteredEvents.length < limit && parseInt(response.data.totalcount) > fetchLimit) {
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

        filteredEvents = [...filteredEvents, ...additionalEvents];
      }
    }

    // Calculate pagination based on filtered results
    const totalCount = genre && genre !== 'all'
      ? filteredEvents.length
      : parseInt(response.data.totalcount);
    
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    
    // Get the correct slice of events for the current page
    // When no genre filter is applied, we don't need to slice as the API already returns the correct page
    const pageEvents = genre && genre !== 'all' 
      ? filteredEvents.slice(0, limit)  // Just take the first 'limit' events from filtered results
      : filteredEvents;  // For unfiltered results, the API already returns the correct page

    return NextResponse.json({
      events: pageEvents.map((event: any) => ({
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
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Error fetching events" },
      { status: 500 }
    );
  }
}