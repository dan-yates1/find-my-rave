import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEvents = await prisma.userEvent.findMany({
      where: { userId: user.id },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const events = {
      upcoming: userEvents
        .filter(
          (ue) =>
            ue.status === "registered" &&
            new Date(ue.event.startDate) > new Date()
        )
        .map((ue) => ue.event),
      past: userEvents
        .filter(
          (ue) =>
            ue.status === "registered" &&
            new Date(ue.event.startDate) <= new Date()
        )
        .map((ue) => ue.event),
      saved: userEvents
        .filter((ue) => ue.status === "saved")
        .map((ue) => ue.event),
    };

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: "Error fetching user events" },
      { status: 500 }
    );
  }
} 