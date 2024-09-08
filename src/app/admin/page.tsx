import { useState, useEffect } from "react";
import { PrismaClient } from "@prisma/client";
import EventCard from "@/components/EventCard";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const events = await prisma.event.findMany({
    where: { approved: false },
  });

  return (
    <div className="max-w-5xl m-auto flex">
      <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
