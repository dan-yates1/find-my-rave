// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3963; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("event") || "";
    const location = searchParams.get("location") || "";
    const priceRange = searchParams.get("priceRange") || "all";
    const eventType = searchParams.get("eventType") || "all";
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get the radius from search params with a default of 30 miles
    const radius = parseInt(searchParams.get("radius") || "30");

    // Get coordinates for searched location using Mapbox
    let searchCoords;
    if (location) {
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`;
      const response = await fetch(mapboxUrl);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        searchCoords = { latitude, longitude };
      }
    }

    // Base query
    let where: any = {
      approved: true,
      title: {
        contains: searchQuery,
        mode: "insensitive",
      },
    };

    // Add price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "free":
          where.price = 0;
          break;
        case "£0-£20":
          where.price = {
            gte: 0,
            lte: 20,
          };
          break;
        case "£20-£50":
          where.price = {
            gt: 20,
            lte: 50,
          };
          break;
        case "£50+":
          where.price = {
            gt: 50,
          };
          break;
      }
    }

    // Add event type filter
    if (eventType !== "all") {
      where.eventType = {
        equals: eventType,
        mode: "insensitive",
      };
    }

    // Get all events that match the base criteria
    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startDate: "asc",
      }
    });

    // Filter events by distance if location is provided
    let filteredEvents = events;
    if (searchCoords) {
      filteredEvents = events.filter(event => {
        if (!event.latitude || !event.longitude) return false;
        
        const distance = calculateDistance(
          searchCoords.latitude,
          searchCoords.longitude,
          event.latitude,
          event.longitude
        );
        
        return distance <= radius; // Use the radius from search params
      });
    }

    // Apply pagination after distance filtering
    const paginatedEvents = filteredEvents.slice(skip, skip + limit);
    const totalEvents = filteredEvents.length;
    const hasMore = skip + limit < totalEvents;

    return NextResponse.json({ 
      events: paginatedEvents, 
      hasMore,
      total: totalEvents 
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
