import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Map from "@/components/Map";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import EventDetailsHeader from "@/components/EventDetailsHeader";

const prisma = new PrismaClient();

interface EventDetailsPageProps {
  params: {
    slug: string;
  };
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const event = await prisma.event.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!event) {
    notFound();
  }

  // Format the date nicely
  const formattedDate = new Date(event.startDate).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(event.startDate).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen">
      <EventDetailsHeader event={event} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Date & Time Section */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Date and time</h2>
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarIcon className="w-6 h-6" />
                <div>
                  <p>{formattedDate}</p>
                  <p>{formattedTime}</p>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <div className="flex items-center gap-3 text-gray-600 mb-4">
                <MapPinIcon className="w-6 h-6 flex-shrink-0" />
                <p>{event.location}</p>
              </div>
              {/* Map */}
              <div className="h-[400px] rounded-xl overflow-hidden">
                <Map events={[event]} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formattedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Tickets
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
