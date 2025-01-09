import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const apiKey = process.env.SKIDDLE_API_KEY;
    const response = await fetch(
      `https://www.skiddle.com/api/v1/events/${params.eventId}/?api_key=${apiKey}&platform=all&imageFilter=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch event from Skiddle');
    }

    const data = await response.json();

    // Add some console.logs to debug the response
    console.log('Skiddle API Response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
} 