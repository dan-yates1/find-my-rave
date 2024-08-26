import { PrismaClient } from "@prisma/client";
import EventCard from "@/components/EventCard";
import Map from "@/components/Map";

const prisma = new PrismaClient();

const FindEventsPage = async () => {
  const events = await prisma.event.findMany({
    where: {
      approved: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const eventsWithCoordinates = events.filter(
    (event) => event.latitude !== null && event.longitude !== null
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Event List */}
      <div className="lg:w-1/2 overflow-y-auto p-6 space-y-4 w-full">
        <h2 className="text-3xl font-bold mb-4">
          Drum and Bass Raves in London, United Kingdom
        </h2>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Map Area - Only render on large screens */}
      <div className="hidden lg:block lg:w-1/2 p-4">
        <Map events={eventsWithCoordinates} />
      </div>
    </div>
  );
};

export default FindEventsPage;
