"use client";

import React from "react";
import { Event } from "@prisma/client";
import Image from "next/image";
import {
  MapIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import SaveEventButton from "./SaveEventButton";

interface EventCardProps {
  event: Event;
  saved?: boolean;
  onHover?: (eventId: string | null) => void;
}

const EventCard = ({ event, saved = false, onHover }: EventCardProps) => {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/events/${event.slug}`);
  };

  const handleMouseEnter = () => {
    onHover?.(event.id);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  // Format the date nicely
  const formattedDate = new Date(event.startDate).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).replace(',', '');

  const formattedTime = new Date(event.startDate).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl hover-effect border border-gray-200/20 dark:border-gray-700/20 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Image Container */}
        <div className="relative w-full md:w-48 h-48 md:h-32 overflow-hidden rounded-xl">
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-500 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-4 h-4" />
                {formattedTime}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <MapIcon className="w-4 h-4" />
                {event.location.split(",")[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button - Bottom right with hover effect */}
      <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <SaveEventButton eventId={event.id} initialSaved={saved} />
      </div>
    </div>
  );
};

export default EventCard;
