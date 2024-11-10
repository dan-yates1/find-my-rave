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

export default function EventCard({ event, onHover = () => {} }: EventCardProps) {
  const router = useRouter();

  // Add null checks for dates
  const formattedDate = event.startDate ? format(new Date(event.startDate), "EEE, MMM d") : '';
  const formattedTime = event.startDate ? format(new Date(event.startDate), "h:mm a") : '';

  // Add null check for location
  const formattedLocation = event.location ? event.location.split(",")[0] : '';

  return (
    <Link
      href={`/events/${event.platform}/${event.id}`}
      className="block group h-full"
      onMouseEnter={() => onHover?.(event.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative h-full bg-white rounded-xl p-4 group-hover:bg-gray-50 transition-colors duration-200">
        {/* Image Container */}
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg mb-4">
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt={event.title || 'Event'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <SaveEventButton 
              eventId={event.id}
              className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 transition-all duration-200 shadow-sm"
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-500 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title || 'Untitled Event'}
          </h3>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formattedTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 col-span-2">
              <MapIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[calc(100%-1.5rem)]" title={event.location}>
                {formattedLocation}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
