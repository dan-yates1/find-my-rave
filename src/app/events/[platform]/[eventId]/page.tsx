import { notFound } from "next/navigation";
import EventDetailsHeader from "@/components/EventDetailsHeader";
import Map from "@/components/Map";
import { CalendarIcon, MapPinIcon, UserIcon, MusicalNoteIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { capitalizeFirstLetter } from "@/lib/utils";

interface EventDetailsPageProps {
  params: {
    platform: string;
    eventId: string;
  };
}

// Add loading and error states
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static page generation

async function getEvent(platform: string, eventId: string) {
  try {
    // Check if we're running on the server side
    const isServer = typeof window === 'undefined';
    
    // Construct the URL based on environment
    const baseUrl = isServer 
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      : '';
    
    const url = `${baseUrl}/api/events/${platform}/${eventId}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Event fetch failed:', {
        status: response.status,
        statusText: response.statusText
      });
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

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.town,
      }
    },
    image: event.imageUrl,
    offers: {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: 'GBP',
      url: event.link,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        <EventDetailsHeader event={event} />
        
        {/* Separator Line */}
        <div className="w-full border-t border-gray-200" />
        
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Info Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Date & Time */}
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Date & Time</h3>
                        <p className="text-gray-900 font-medium">{formattedDate}</p>
                        <p className="text-gray-600">{formattedTime}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <MapPinIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Venue</h3>
                        <p className="text-gray-900 font-medium">{event.location}</p>
                        <p className="text-gray-600">{event.town}</p>
                      </div>
                    </div>

                    {/* Age Restriction */}
                    {event.minAge && (
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 rounded-xl p-3">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 mb-1">Age Restriction</h3>
                          <p className="text-gray-900 font-medium">{event.minAge}+</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">About this event</h2>
                  <div className="prose max-w-none text-gray-600">
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  </div>
                </div>

                {/* Artists Section */}
                {event.artists && event.artists.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Featured Artists</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.artists.map((artist: any) => (
                        <div key={artist.id} className="flex items-center gap-4">
                          {artist.image ? (
                            <img src={artist.image} alt={artist.name} className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                              <MusicalNoteIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                            {artist.genre && <p className="text-sm text-gray-500">{artist.genre}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map Section */}
                {event.latitude && event.longitude && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Location</h2>
                    {event.venue && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">{event.venue.name}</h3>
                        <p className="text-gray-600">
                          {event.venue.town}
                          {event.venue.postcode && `, ${event.venue.postcode}`}
                        </p>
                        {event.venue.phone && (
                          <p className="text-gray-600 mt-1">
                            <PhoneIcon className="w-4 h-4 inline mr-2" />
                            {event.venue.phone}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="h-[400px] rounded-xl overflow-hidden">
                      <Map 
                        events={[{
                          ...event,
                          id: event.id,
                          title: event.title,
                          latitude: Number(event.latitude),
                          longitude: Number(event.longitude),
                          location: event.location,
                          startDate: event.startDate,
                          platform: event.platform || 'skiddle',
                          link: event.link,
                          imageUrl: event.imageUrl,
                          price: event.price,
                          description: event.description,
                          endDate: event.endDate,
                          slug: event.id,
                        }]} 
                        center={[Number(event.longitude), Number(event.latitude)]}
                        zoom={15}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Ticket Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="space-y-6">
                    {/* Platform Badge */}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      event.platform === 'skiddle' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {capitalizeFirstLetter(event.platform)}
                    </span>

                    {/* Price */}
                    {/* <div>
                      <h3 className="text-xl font-semibold mb-2">Price</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {event.price === null || event.price === undefined ? 
                          'Price not available' : 
                          event.price === 0 ? 
                            'Free' : 
                            `£${event.price.toFixed(2)}`
                        }
                      </p>
                    </div> */}

                    {/* Opening Times */}
                    {event.openingtimes?.doorsopen && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Opening Times</h3>
                        <div className="space-y-2 text-sm">
                          <p className="flex justify-between">
                            <span className="text-gray-600">Doors Open</span>
                            <span className="font-medium">{event.openingtimes.doorsopen}</span>
                          </p>
                          {event.openingtimes.lastentry && (
                            <p className="flex justify-between">
                              <span className="text-gray-600">Last Entry</span>
                              <span className="font-medium">{event.openingtimes.lastentry}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ticket Link */}
                  </div>
                </div>

                {/* Share Event */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Share Event</h3>
                  <div className="flex gap-4">
                    <button className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                      <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
