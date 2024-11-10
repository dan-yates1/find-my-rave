import { notFound } from "next/navigation";
import EventDetailsHeader from "@/components/EventDetailsHeader";
import Map from "@/components/Map";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface EventDetailsPageProps {
  params: {
    platform: string;
    eventId: string;
  };
}

async function getEvent(platform: string, eventId: string) {
  try {
    const response = await fetch(`${process.env.EVENTS_API_URL}/events/${platform}/${eventId}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error('Event not found');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const event = await getEvent(params.platform, params.eventId);

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
    <div className="min-h-screen bg-gray-50">
      <EventDetailsHeader event={event} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Date & Time Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
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
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <div className="flex items-center gap-3 text-gray-600 mb-4">
                <MapPinIcon className="w-6 h-6 flex-shrink-0" />
                <p>{event.location}</p>
              </div>
              {/* Map */}
              {event.latitude && event.longitude && (
                <div className="h-[400px] rounded-xl overflow-hidden">
                  <Map events={[event]} center={[event.latitude, event.longitude]} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Badge */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                event.platform === 'skiddle' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {event.platform}
              </span>
            </div>

            {/* Price */}
            {event.price > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Price</h3>
                <p className="text-2xl font-bold">£{event.price.toFixed(2)}</p>
              </div>
            )}
            
            {/* Ticket Link */}
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Tickets
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 