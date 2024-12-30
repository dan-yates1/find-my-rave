"use client";

import { Event } from "@prisma/client";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BookmarkButton from './BookmarkButton';

interface EventDetailsHeaderProps {
  event: Event;
}

const EventDetailsHeader = ({ event }: EventDetailsHeaderProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Event Image */}
      <div 
        className="relative w-full h-[400px] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={event.imageUrl || '/event-placeholder.jpg'}
          alt={event.title}
          fill
          className="object-cover blur-md scale-105"
            
          priority
        />
        
        
        {/* Bookmark Button - Positioned in top right */}
        <div className="absolute top-4 right-4 z-10">
          <BookmarkButton 
            eventId={event.id}
            variant="detail"
            size="lg"
          />
        </div>
      </div>

      {/* Event Details */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        
        <div className="flex flex-wrap gap-4">
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
      </div>
    </div>
  );
};

export default EventDetailsHeader;