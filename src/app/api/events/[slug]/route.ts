import { NextResponse } from 'next/server';
import axios from "axios";

const EVENTS_API_URL = process.env.EVENTS_API_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Extract the event ID from the slug
    const eventId = params.slug;

    // Fetch from your custom API
    const response = await axios.get(`${EVENTS_API_URL}/events/${eventId}`);
    const event = response.data;

    // Transform the event data to match the expected format
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
      imageUrl: event.imageUrl,
      price: event.price || 0,
      link: event.link || '',
      eventType: event.eventType?.toLowerCase() || 'club',
      approved: event.approved,
      slug: event.slug
    };

    return NextResponse.json(transformedEvent);
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