import { NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { GENRE_MAPPINGS, SKIDDLE_GENRE_MAPPING } from '@/lib/constants';

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

    let params = new URLSearchParams({
      api_key: process.env.SKIDDLE_API_KEY!,
      keyword,
      offset: offset.toString(),
      limit: limit.toString(),
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
      // Note: In a production app, you'd want to use a geocoding service here
      // to convert location string to lat/long
      params.append('keyword', `${keyword} ${location}`);
    }

    // Add genre filtering if specified
    if (genre && GENRE_MAPPINGS[genre as keyof typeof GENRE_MAPPINGS]) {
      // Find all relevant Skiddle eventcodes for this genre
      const relevantEventCodes = Object.entries(SKIDDLE_GENRE_MAPPING)
        .filter(([_, genres]) => (genres as readonly string[]).includes(genre as string))
        .map(([code]) => code);

      if (relevantEventCodes.length > 0) {
        params.append('eventcode', relevantEventCodes.join(','));
      }
      
      // Add additional genre-specific parameters
      if (genre === 'DNB') {
        params.append('keyword', params.get('keyword') + ' "drum and bass" dnb');
      }
    }

    console.log('Calling Skiddle API with params:', params.toString());
    const response = await axios.get(`${SKIDDLE_API_BASE}/events/search?${params.toString()}`);
    
    // Transform Skiddle response to match your app's format
    const events = response.data.results.map((event: any) => ({
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
    }));

    return NextResponse.json({
      events,
      hasMore: offset + limit < response.data.totalcount,
      total: response.data.totalcount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(response.data.totalcount / limit),
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
