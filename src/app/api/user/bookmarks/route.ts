import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Just get the bookmarked event IDs
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.email,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch event details from Skiddle API
    const eventDetails = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const response = await fetch(
          `https://www.skiddle.com/api/v1/events/${bookmark.eventId}/?api_key=${process.env.SKIDDLE_API_KEY}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return {
          ...bookmark,
          event: data.results
        };
      })
    );

    // Filter out any failed requests
    const validBookmarks = eventDetails.filter(bookmark => bookmark?.event);

    return NextResponse.json({ bookmarks: validBookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
} 