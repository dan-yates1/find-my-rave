import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Map from "@/components/Map";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

const prisma = new PrismaClient();

interface EventDetailsPageProps {
  params: {
    slug: string;
  };
}

const EventDetailsPage = async ({ params }: EventDetailsPageProps) => {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image
          src={event.imageUrl || "/rave-bg.jpg"}
          alt={event.title}
          fill
          className="object-cover"
        />
        <div className="relative z-20 h-full flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex items-center gap-6 text-white/90">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {new Date(event.startDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Event Schedule</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Doors Open</h3>
                    <p className="text-gray-600">
                      {new Date(event.startDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Event Ends</h3>
                    <p className="text-gray-600">
                      {new Date(event.endDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Ticket Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <button className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  Get Tickets
                </button>
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-2">Share this event</h3>
                  <div className="flex gap-4">
                    {/* Add social share buttons */}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-48 relative">
                  <Map
                    events={[{
                      id: event.id,
                      title: event.title,
                      latitude: event.latitude,
                      longitude: event.longitude,
                    }]}
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-medium mb-2">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
