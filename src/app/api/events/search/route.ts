// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = page * limit;

  try {
    // Perform a single transaction to get both the events and the total count
    const [events, totalEvents] = await prisma.$transaction([
      prisma.event.findMany({
        where: {
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
        },
        orderBy: {
          startDate: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.event.count({
        where: {
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
        },
      }),
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
