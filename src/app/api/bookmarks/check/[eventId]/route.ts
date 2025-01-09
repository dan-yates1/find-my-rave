import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ isBookmarked: false });
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.email,
        eventId: params.eventId,
      },
    });

    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return NextResponse.json({ isBookmarked: false });
  }
} 