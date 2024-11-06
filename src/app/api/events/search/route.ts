// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";
  const dateRange = searchParams.get("dateRange") || "all";
  const priceRange = searchParams.get("priceRange") || "all";
  const eventType = searchParams.get("eventType") || "all";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = page * limit;

  try {
    // Build the where clause based on filters
    const where: any = {
      approved: true,
      AND: [
        {
          title: {
            contains: eventQuery,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: locationQuery,
            mode: "insensitive",
          },
        },
      ],
    };

    // Add date range filter
    if (dateRange !== "all") {
      const now = new Date();
      switch (dateRange) {
        case "today":
          where.startDate = {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999)),
          };
          break;
        case "this week":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          where.startDate = {
            gte: weekStart,
            lte: weekEnd,
          };
          break;
        case "this month":
          where.startDate = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
          break;
      }
    }

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

    // Perform the query with filters
    const [events, totalEvents] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        orderBy: {
          startDate: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const hasMore = skip + limit < totalEvents;

    return NextResponse.json({ events, hasMore });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
