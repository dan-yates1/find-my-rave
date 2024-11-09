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
import Link from "next/link";
import { format } from "date-fns";

interface EventCardProps {
  event: Event & {
    platform: string;
  };
  onHover?: (id: string | null) => void;
}

export default function EventCard({ event, onHover }: EventCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/events/${event.id}`);
  };

  // Format the date nicely
  const formattedDate = format(new Date(event.startDate), "EEE, MMM d");
  const formattedTime = format(new Date(event.startDate), "h:mm a");

  return (
    <Link
      href={`/events/${event.platform}/${event.id}`}
      className="block group"
      onMouseEnter={() => onHover?.(event.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative flex flex-col md:flex-row gap-6 p-4 group-hover:bg-gray-50 transition-colors duration-200">
        {/* Image Container */}
        <div className="relative w-full md:w-48 h-48 md:h-32 overflow-hidden rounded-xl">
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 right-2">
            <SaveEventButton 
              eventId={event.id}
              className="bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 transition-all duration-200"
              iconClassName="w-5 h-5"
            />
          </div>
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              event.platform === 'skiddle' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {event.platform}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-500 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                {formattedTime}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapIcon className="w-4 h-4" />
                {event.location.split(",")[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
