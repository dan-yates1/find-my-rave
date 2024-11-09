// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const EVENTS_API_URL = process.env.EVENTS_API_URL || "http://localhost:8000";
const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("event") || "";
    const location = searchParams.get("location") || "";
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const eventType = searchParams.get("eventType") || "CLUB";

    // If this is a location suggestion request
    if (searchParams.get("type") === "location-suggestions") {
      if (!location) {
        return NextResponse.json({ suggestions: [] });
      }

      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${MAPBOX_API_KEY}&country=GB&types=place,locality`;

      const response = await fetch(mapboxUrl);
      const data = await response.json();

      const suggestions = data.features?.map((feature: any) => ({
        name: feature.place_name,
        coordinates: feature.center,
      })) || [];

      return NextResponse.json({ suggestions });
    }

    // Otherwise, this is an event search request
    const params = {
      keywords: searchQuery.replace(/\s+/g, '+'),
      location: location,
      max_events: (skip + limit).toString() // Request enough events to cover pagination
    };

    console.log('Fetching events from custom API:', params);

    const response = await axios.get(`${EVENTS_API_URL}/events/`, {
      params,
      headers: {
        'Accept': 'application/json',
      }
    });

    const allEvents = response.data || [];
    
    // Handle pagination
    const paginatedEvents = allEvents.slice(skip, skip + limit);
    const totalEvents = allEvents.length;
    const hasMore = skip + limit < totalEvents;

    return NextResponse.json({
      events: paginatedEvents,
      hasMore,
      total: totalEvents
    });

  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { 
        message: "Error fetching data",
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}
