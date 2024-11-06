"use client";

import { Event } from "@prisma/client";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import SaveEventButton from "./SaveEventButton";

interface EventDetailsHeaderProps {
  event: Event;
}

const EventDetailsHeader = ({ event }: EventDetailsHeaderProps) => {
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
    <div className="relative">
      {/* Hero Image */}
      <div className="relative h-[400px] w-full">
        <Image
          src={event.imageUrl || "/event-placeholder2.jpg"}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Event Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          {/* Custom styled save button for event details */}
          <SaveEventButton 
            eventId={event.id} 
            className="text-gray-600 bg-gray-100/50 w-8 h-8 !p-1.5 !hover:bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetailsHeader; 