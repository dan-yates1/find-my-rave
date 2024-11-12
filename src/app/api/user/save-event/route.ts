import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, action, eventData } = await req.json();

    // Validate eventId
    if (!eventId || eventId === 'unknown') {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === 'save') {
      // Generate a slug using a fallback if platform is not available
      const slug = eventData?.platform 
        ? `${eventData.platform}-${eventId}`
        : `event-${eventId}`;

      // Convert date strings to Date objects and handle null/undefined cases
      const startDate = eventData?.startDate ? new Date(eventData.startDate) : new Date();
      const endDate = eventData?.endDate ? new Date(eventData.endDate) : null;

      // Create the base event data
      const eventDataToSave = {
        title: eventData?.title || 'Untitled Event',
        startDate,
        endDate,
        location: eventData?.location || 'Location not specified',
        slug,
        description: eventData?.description || null,
        latitude: eventData?.latitude || null,
        longitude: eventData?.longitude || null,
        link: eventData?.link || null,
        imageUrl: eventData?.imageUrl || null,
        price: eventData?.price || 0,
        eventType: eventData?.eventType || 'other',
        platform: eventData?.platform || null,
        approved: true,
        updatedAt: new Date(),
      };

      // First, ensure the event exists in our database
      await prisma.event.upsert({
        where: { 
          id: eventId.toString() 
        },
        update: eventDataToSave,
        create: {
          id: eventId.toString(),
          ...eventDataToSave,
          createdAt: new Date(),
        },
      });

      // Then create the user-event relationship
      await prisma.userEvent.create({
        data: {
          userId: user.id,
          eventId: eventId.toString(),
          status: 'saved',
        },
      });
    } else if (action === 'unsave') {
      await prisma.userEvent.deleteMany({
        where: {
          userId: user.id,
          eventId: eventId.toString(),
          status: 'saved',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving event:", error);
    return NextResponse.json(
      { error: "Failed to save event" },
      { status: 500 }
    );
  }
} 