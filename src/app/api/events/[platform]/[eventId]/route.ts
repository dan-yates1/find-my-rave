import { NextResponse } from 'next/server';
import axios from "axios";

const EVENTS_API_URL = process.env.EVENTS_API_URL;

export async function GET(
  request: Request,
  { params }: { params: { platform: string; eventId: string } }
) {
  try {
    // Fetch from your custom API
    const response = await axios.get(`${EVENTS_API_URL}/events/${params.platform}/${params.eventId}`);
    const event = response.data;

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { 
        message: "Event not found",
        details: error.message
      },
      { status: error.response?.status || 404 }
    );
  }
} 