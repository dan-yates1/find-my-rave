// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { redis } from "@/lib/redis";
import { z } from "zod";

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

    const cacheKey = `events:${searchQuery}:${location}:${skip}:${limit}`;
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

    // If no cache, fetch from API
    const params = {
      keywords: searchQuery.replace(/\s+/g, "+"),
      location: location,
      max_events: (skip + limit).toString(),
      platform: "skiddle",
    };

    const response = await axios.get(`${process.env.EVENTS_API_URL}/events/`, {
      params,
      headers: {
        Accept: "application/json",
      },
    });

    const allEvents = response.data || [];
    const eventsWithPlatform = allEvents.map((event: any) => ({
      ...event,
      ...(event.platform && { platform: event.platform }),
    }));

    // Sort events by date (closest first)
    /*  const sortedEvents = eventsWithPlatform.sort((a: any, b: any) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }); */

    const paginatedEvents = allEvents.slice(skip, skip + limit);
    const totalEvents = allEvents.length;
    const hasMore = skip + limit < totalEvents;

    const responseData: CachedData = {
      events: paginatedEvents,
      hasMore,
      total: totalEvents,
    };

    // Cache the results
    await redis.set(cacheKey, responseData, { ex: 300 }); // Cache for 5 minutes
    console.log("✅ Cached new data for:", cacheKey);

    clearTimeout(timeout);
    return NextResponse.json({
      ...responseData,
      fromCache: false,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error fetching data", details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
