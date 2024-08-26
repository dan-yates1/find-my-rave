import { NextApiRequest, NextApiResponse } from "next";
import { createEventSchema } from "@/lib/validation";
import { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const prisma = new PrismaClient();

    const data = createEventSchema.parse(req.body);

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
        slug,
        approved: true,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(400).json({ message: "Invalid data", error });
  }
}
