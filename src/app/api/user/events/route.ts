import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userEvents: {
          where: { status: 'saved' },
          include: {
            event: mode !== 'ids',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (mode === 'ids') {
      const savedEventIds = user?.userEvents.map(ue => ue.eventId) || [];
      return NextResponse.json({ savedEventIds });
    }

    const savedEvents = user?.userEvents.map(ue => ue.event) || [];
    return NextResponse.json({ savedEvents });
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: "Failed to fetch user events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, action, eventData } = await req.json();

    if (action === 'save') {
      await prisma.userEvent.create({
        data: {
          userId: session.user.email,
          eventId: eventId.toString(),
          status: 'saved',
        },
      });
    } else if (action === 'unsave') {
      await prisma.userEvent.deleteMany({
        where: {
          userId: session.user.email,
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