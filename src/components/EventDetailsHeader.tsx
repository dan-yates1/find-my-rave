"use client";

import { Event } from "@prisma/client";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import BookmarkButton from './BookmarkButton';

interface EventDetailsHeaderProps {
  event: Event & { link?: string };
}

const EventDetailsHeader = ({ event }: EventDetailsHeaderProps) => {
  const { data: session } = useSession();

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={event.imageUrl || '/event-placeholder.jpg'}
        alt={event.title}
        fill
        className="object-cover transition-transform duration-500 scale-105 hover:scale-110"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Bookmark Button */}
      <div className="absolute top-4 right-4 z-10">
        <BookmarkButton
          eventId={event.id}
          variant="detail"
          size="lg"
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{event.title}</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <span>
              {new Date(event.startDate).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            <span>
              {new Date(event.startDate).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            <span>{event.location}</span>
          </div>
        </div>
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg"
          >
            Get Tickets
          </a>
        )}
      </div>
    </div>
  );
};

export default EventDetailsHeader;
