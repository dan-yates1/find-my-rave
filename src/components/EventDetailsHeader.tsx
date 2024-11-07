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
  }).replace(',', '');

  const formattedTime = new Date(event.startDate).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative">
      {/* Hero Image Container */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* Background blurred image */}
        <div className="absolute inset-0 scale-125" style={{ filter: 'blur(0px)' }}>
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt=""
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>
        
        {/* Sharp foreground image */}
        <div className="absolute inset-0 opacity-90">
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt={event.title}
            fill
            className="object-cover blur-md"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Event Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
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
          <SaveEventButton 
            eventId={event.id} 
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-3 transition-all duration-200"
            iconClassName="w-7 h-7"
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetailsHeader; 