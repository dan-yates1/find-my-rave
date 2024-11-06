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

    const { eventId, action } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === 'save') {
      await prisma.userEvent.create({
        data: {
          userId: user.id,
          eventId: eventId,
          status: 'saved',
        },
      });
    } else if (action === 'unsave') {
      await prisma.userEvent.deleteMany({
        where: {
          userId: user.id,
          eventId: eventId,
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