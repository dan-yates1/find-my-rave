"use client";

import { Event } from "@prisma/client";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ClockIcon, CameraIcon } from "@heroicons/react/24/outline";
import SaveEventButton from "./SaveEventButton";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
        className="relative w-full h-[400px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={event.imageUrl || '/event-placeholder.jpg'}
          alt={event.title}
          fill
          className="object-cover"
            
          priority
        />
        
        
        {/* Save Button - Positioned in top right */}
        <div className="absolute bottom-4 right-4 z-10">
          <SaveEventButton 
            eventId={event.id}
            eventData={event}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 rounded-full p-2.5 transition-all duration-200"
            iconClassName="w-6 h-6 text-white"
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