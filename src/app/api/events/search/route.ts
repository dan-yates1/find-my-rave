// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { redis } from "@/lib/redis";
import { z } from "zod";
import { getDateRangeFilter } from "@/lib/utils";

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

const searchParamsSchema = z.object({
  event: z.string().optional(),
  location: z.string().optional(),
  skip: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  platform: z.string().optional(),
  dateRange: z.string().optional(),
  customDate: z.string().optional(),
  priceRange: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const validatedParams = searchParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    // Add request timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const searchQuery = validatedParams.event || "";
    const location = validatedParams.location || "";
    const skip = validatedParams.skip || 0;
    const limit = validatedParams.limit || 36;
    const platform = validatedParams.platform;
    const dateRange = validatedParams.dateRange;
    const customDate = validatedParams.customDate;

    const cacheKey = `events:${searchQuery}:${location}:${skip}:${limit}:${platform}:${dateRange}:${customDate}`;
    console.log("Checking cache for key:", cacheKey);

    // Try to get cached results first
    const cachedData = await redis.get<CachedData>(cacheKey);
    if (cachedData) {
      console.log("🎯 Cache HIT! Returning cached data for:", cacheKey);
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
      });
    }

    console.log("❌ Cache MISS! Fetching fresh data for:", cacheKey);

    // Build params object for the backend API
    const params: Record<string, string> = {
      keywords: searchQuery.replace(/\s+/g, "+"),
      max_events: (skip + limit).toString(),
    };

    // Only add optional parameters if they exist
    if (location) {
      params.location = location;
    }

    if (platform && platform !== "all") {
      params.platform = "skiddle";
    }

    // Handle date filtering
    if (dateRange && dateRange !== "all") {
      const dates = getDateRangeFilter(dateRange, customDate);
      if (dates) {
        params.from_date = dates.startDate.toISOString().split("T")[0];
        params.to_date = dates.endDate.toISOString().split("T")[0];
      }
    }

    const baseUrl = process.env.EVENTS_API_URL?.replace(/\/+$/, "");
    const response = await axios.get(`${baseUrl}/events`, {
      params,
      headers: {
        Accept: "application/json",
      },
    });

    // Handle 404 gracefully
    if (response.status === 404) {
      return NextResponse.json({
        events: [],
        hasMore: false,
        total: 0,
        fromCache: false,
      });
    }

    const allEvents = response.data || [];
    const eventsWithPlatform = allEvents.map((event: any) => ({
      ...event,
      ...(event.platform && { platform: event.platform }),
    }));

    const paginatedEvents = allEvents.slice(skip, skip + limit);
    const totalEvents = allEvents.length;
    const hasMore = skip + limit < totalEvents;

    const responseData: CachedData = {
      events: paginatedEvents,
      hasMore,
      total: totalEvents,
    };

    // Cache the results
    await redis.set(cacheKey, responseData, { ex: 300 });
    console.log("✅ Cached new data for:", cacheKey);

    clearTimeout(timeout);
    return NextResponse.json({
      ...responseData,
      fromCache: false,
    });
  } catch (error: any) {
    console.error(
      "Error fetching events:",
      error.response?.data || error.message
    );

    // Return empty results for 404
    if (error.response?.status === 404) {
      return NextResponse.json({
        events: [],
        hasMore: false,
        total: 0,
        fromCache: false,
      });
    }

    // Handle other errors
    return NextResponse.json(
      {
        message: "Error fetching data",
        details: error.response?.data?.detail || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
