import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ savedEvents: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userEvents: {
          where: { status: 'saved' },
          select: { eventId: true }
        }
      }
    });

    const savedEventIds = user?.userEvents.map(ue => ue.eventId) || [];
    return NextResponse.json({ savedEventIds });
  } catch (error) {
    console.error("Error checking saved events:", error);
    return NextResponse.json({ savedEventIds: [] }, { status: 500 });
  }
} 