import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userEvents: {
          where: { status: 'saved' },
          include: {
            event: true
          }
        }
      }
    });

    const savedEvents = user?.userEvents.map(ue => ue.event) || [];
    return NextResponse.json({ savedEvents });
  } catch (error) {
    console.error("Error fetching saved events:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved events" },
      { status: 500 }
    );
  }
} 