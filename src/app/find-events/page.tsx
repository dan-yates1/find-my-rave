import { PrismaClient } from "@prisma/client";
import EventCard from "@/components/EventCard";
import Map from "@/components/Map";

const prisma = new PrismaClient();

const FindEventsPage = async () => {
  // Fetch events from the database
  const events = await prisma.event.findMany({
    where: {
      approved: true, // Fetch only approved events
    },
    orderBy: {
      startDate: "asc", // Order by start date
    },
  });

  // Map event data to include latitude and longitude (you need to add these fields to your schema)
  const eventsWithCoordinates = events.map((event) => ({
    ...event,
    latitude: 51.5074, // Default latitude, replace with actual
    longitude: -0.1276, // Default longitude, replace with actual
  }));

  return (
    <div className="flex h-screen">
      {/* Event List */}
      <div className="w-1/2 overflow-y-auto p-6 space-y-4">
        <h2 className="text-3xl font-bold mb-4">
          Drum and Bass Raves in London, United Kingdom
        </h2>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Map Area */}
      <div className="w-1/2 p-4 bg-gray-100">
        <Map events={eventsWithCoordinates} />
        {/* <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <p>Map will be displayed here</p>
        </div> */}
      </div>
    </div>
  );
};

export default FindEventsPage;
