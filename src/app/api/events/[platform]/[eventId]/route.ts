import { NextResponse } from 'next/server';
import axios from "axios";

const SKIDDLE_API_BASE = "https://www.skiddle.com/api/v1";

export async function GET(
  request: Request,
  { params }: { params: { platform: string; eventId: string } }
) {
  try {
    if (params.platform !== 'skiddle') {
      throw new Error('Only Skiddle events are supported');
    }

    const response = await axios.get(`${SKIDDLE_API_BASE}/events/${params.eventId}`, {
      params: {
        api_key: process.env.SKIDDLE_API_KEY,
        description: '1',
        venue: '1',
        artist: '1'
      }
    });

    const skiddleEvent = response.data.results;

    // Transform to your app's format with additional fields
    const event = {
      id: skiddleEvent.id,
      title: skiddleEvent.eventname,
      description: skiddleEvent.description || '',
      startDate: skiddleEvent.startdate,
      endDate: skiddleEvent.enddate || skiddleEvent.startdate,
      location: skiddleEvent.venue.name,
      town: skiddleEvent.venue.town,
      latitude: parseFloat(skiddleEvent.venue.latitude),
      longitude: parseFloat(skiddleEvent.venue.longitude),
      link: skiddleEvent.link,
      imageUrl: skiddleEvent.largeimageurl || skiddleEvent.imageurl,
      price: skiddleEvent.entryprice || 0,
      platform: 'skiddle',
      approved: true,
      artists: skiddleEvent.artists || [],
      genres: skiddleEvent.genres || [],
      minAge: skiddleEvent.MinAge || null,
      venue: {
        name: skiddleEvent.venue.name,
        town: skiddleEvent.venue.town,
        postcode: skiddleEvent.venue.postcode,
        country: skiddleEvent.venue.country,
        phone: skiddleEvent.venue.phone,
        website: skiddleEvent.venue.webLink,
      },
      ticketsAvailable: skiddleEvent.tickets || false,
      openingtimes: {
        doorsopen: skiddleEvent.openingtimes?.doorsopen || null,
        doorsclose: skiddleEvent.openingtimes?.doorsclose || null,
        lastentry: skiddleEvent.openingtimes?.lastentry || null,
      }
    };

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