"use client";

import React from "react";
import { Event } from "@prisma/client";
import Image from "next/image";
import {
  MapIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
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

export default function EventCard({
  event,
  onHover = () => {},
}: EventCardProps) {
  const router = useRouter();

  // Add null checks for dates
  const formattedDate = event.startDate
    ? format(new Date(event.startDate), "EEE, MMM d")
    : "";
  const formattedTime = event.startDate
    ? format(new Date(event.startDate), "h:mm a")
    : "";

  // Add null check for location
  const formattedLocation = event.location ? event.location.split(",")[0] : "";

  return (
    <Link
      href={`/events/${event.platform}/${event.id}`}
      className="block h-full"
      onMouseEnter={() => onHover?.(event.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200">
        {/* Image Container - Fixed aspect ratio */}
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-xl">
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt={event.title || "Event"}
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
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                event.platform === "skiddle"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {event.platform}
            </span>
          </div>
        </div>

        {/* Content Container - Flex grow to fill remaining space */}
        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>

          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center text-gray-500 text-sm">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>
                {formattedDate} • {formattedTime}
              </span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span className="truncate">{formattedLocation}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
