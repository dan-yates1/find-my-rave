import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { eventIds } = await request.json();

    if (!Array.isArray(eventIds)) {
      return NextResponse.json({ error: "Invalid event IDs" }, { status: 400 });
    }

    const events = await prisma.event.findMany({
      where: {
        id: {
          in: eventIds
        },
        approved: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
} 