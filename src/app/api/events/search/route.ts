// src/app/api/events/search/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";

  try {
    const events = await prisma.event.findMany({
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
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
