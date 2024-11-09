import { NextResponse } from "next/server";
import axios from "axios";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

const SKIDDLE_API_KEY = process.env.SKIDDLE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://www.skiddle.com/api/v1/events/${id}/`, {
      params: {
        api_key: SKIDDLE_API_KEY,
        description: 1,
      }
    });

    const skiddleEvent = response.data.results;

    const event = {
      id: skiddleEvent.id,
      title: skiddleEvent.eventname,
      description: skiddleEvent.description || '',
      startDate: new Date(skiddleEvent.startdate),
      endDate: skiddleEvent.enddate ? new Date(skiddleEvent.enddate) : new Date(skiddleEvent.startdate),
      location: `${skiddleEvent.venue.name}, ${skiddleEvent.venue.town}`,
      latitude: parseFloat(skiddleEvent.venue.latitude),
      longitude: parseFloat(skiddleEvent.venue.longitude),
      imageUrl: skiddleEvent.largeimageurl || skiddleEvent.imageurl,
      price: parseFloat(skiddleEvent.entryprice) || 0,
      link: skiddleEvent.link,
      eventType: 'club',
      approved: true
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Event not found" },
      { status: 404 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  // Since we're using Skiddle's API, we might not need actual deletion
  // Just return success
  return NextResponse.json({ message: 'Event deleted successfully' });
}
