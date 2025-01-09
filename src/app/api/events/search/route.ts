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

    const keyword = validatedParams.event || "";
    const location = validatedParams.location || "";
    const offset = validatedParams.skip || 0;
    const limit = Math.min(validatedParams.limit || 12, 24);
    const dateRange = validatedParams.dateRange;
    const customDate = validatedParams.customDate;
    const genre = searchParams.get('genre');

    // Increase the limit when fetching to account for filtering
    const apiLimit = genre && genre !== 'all' ? limit * 3 : limit; // Fetch more events if filtering
    
    let params = new URLSearchParams({
      api_key: process.env.SKIDDLE_API_KEY!,
      keyword,
      offset: offset.toString(),
      limit: apiLimit.toString(), // Use increased limit
      order: 'trending',
      description: '1',
      ticketsavailable: '1',
    });

    // Add date filtering based on dateRange or customDate
    if (dateRange || customDate) {
      const today = new Date();
      
      if (customDate) {
        // For custom date, use the exact date for both min and max
        params.append('minDate', customDate);
        params.append('maxDate', customDate);
      } else {
        switch (dateRange) {
          case 'today': {
            const todayStr = today.toISOString().split('T')[0];
            params.append('minDate', todayStr);
            params.append('maxDate', todayStr);
            break;
          }
          case 'tomorrow': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            params.append('minDate', tomorrowStr);
            params.append('maxDate', tomorrowStr);
            break;
          }
          case 'this-week': {
            const endOfWeek = new Date(today);
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            params.append('minDate', today.toISOString().split('T')[0]);
            params.append('maxDate', endOfWeek.toISOString().split('T')[0]);
            break;
          }
          case 'weekend': {
            // Find next Friday and Sunday
            const friday = new Date(today);
            const daysUntilFriday = (5 + 7 - friday.getDay()) % 7;
            friday.setDate(friday.getDate() + daysUntilFriday);
            
            const sunday = new Date(friday);
            sunday.setDate(sunday.getDate() + 2);
            
            params.append('minDate', friday.toISOString().split('T')[0]);
            params.append('maxDate', sunday.toISOString().split('T')[0]);
            break;
          }
          case 'all':
          default:
            // If 'all' is selected, don't add date filters
            break;
        }
      }
    }

    // Add location search if provided
    if (location) {
      const coords = await getLatLon(location);
      if (coords) {
        params.append('latitude', coords.lat.toString());
        params.append('longitude', coords.lon.toString());
        params.append('radius', '20'); // 20 miles radius - adjust as needed
      } else {
        // Fallback to keyword-based location search if geocoding fails
        params.append('keyword', `${keyword} ${location}`);
      }
    }

    // Add genre filtering with logging
    if (genre && SKIDDLE_GENRE_IDS[genre as keyof typeof SKIDDLE_GENRE_IDS]) {
      const genreIds = SKIDDLE_GENRE_IDS[genre as keyof typeof SKIDDLE_GENRE_IDS];
      params.append('genreids', genreIds.join(','));
      console.log('Filtering by genre:', genre);
      console.log('Using genre IDs:', genreIds);
    }

    // Log the final URL being called
    const url = `${SKIDDLE_API_BASE}/events/search?${params.toString()}`;
    console.log('Calling Skiddle API:', url);

    const response = await axios.get(url);
    console.log('Skiddle response:', response.data);

    // Filter events based on genre if specified
    let filteredEvents = response.data.results;
    if (genre && genre !== 'all' && GENRE_TO_SKIDDLE_IDS[genre as keyof typeof GENRE_TO_SKIDDLE_IDS]) {
      const validGenreIds = GENRE_TO_SKIDDLE_IDS[genre as keyof typeof GENRE_TO_SKIDDLE_IDS];
      
      filteredEvents = response.data.results.filter((event: any) => 
        event.genres?.some((eventGenre: SkiddleGenre) => 
          validGenreIds.includes(eventGenre.genreid)
        )
      );
      
      console.log(`Filtered from ${response.data.results.length} to ${filteredEvents.length} events for genre ${genre}`);
    }

    // Calculate pagination values
    const totalFilteredCount = genre && genre !== 'all' 
      ? filteredEvents.length 
      : response.data.totalcount;

    const totalPages = Math.max(1, Math.ceil(totalFilteredCount / limit));
    const currentPage = Math.min(Math.floor(offset / limit) + 1, totalPages);

    // Calculate the correct slice for the current page
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, filteredEvents.length);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Transform and return events
    return NextResponse.json({
      events: paginatedEvents.map((event: any) => ({
        id: event.id,
        title: event.eventname,
        description: event.description || '',
        startDate: event.startdate,
        endDate: event.enddate || event.startdate,
        location: event.venue.name,
        town: event.venue.town,
        latitude: parseFloat(event.venue.latitude),
        longitude: parseFloat(event.venue.longitude),
        link: event.link,
        imageUrl: event.largeimageurl || event.imageurl,
        price: event.entryprice || 0,
        platform: 'skiddle',
        approved: true,
        // Add new fields from description=1 parameter
        artists: event.artists || [],
        genres: event.genres || [],
        minAge: event.MinAge || null,
      })),
      hasMore: currentPage < totalPages,
      total: totalFilteredCount,
      currentPage,
      totalPages,
      fromCache: false,
    });

  } catch (error: any) {
    console.error("Error fetching events:", error.response?.data || error.message);
    return NextResponse.json(
      {
        message: "Error fetching events",
        details: error.response?.data?.error || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
