import { NextResponse } from "next/server";
import { createEventSchema } from "@/lib/validation";
import { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createEventSchema.parse(body);

    const slug = slugify(data.title);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        link: data.link,
        imageUrl: data.imageUrl || null,
        price: data.price,
        eventType: data.eventType,
        slug,
        approved: false,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Invalid data", error },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
