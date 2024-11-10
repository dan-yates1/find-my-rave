"use client";

import React, { useState } from "react";
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
    platform?: string;
  };
  onHover?: (id: string | null) => void;
}

export default function EventCard({
  event,
  onHover = () => {},
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const formattedDate = event?.startDate
    ? format(new Date(event.startDate), 'EEE, MMM d, yyyy')
    : 'Date TBA';

  const formattedTime = event?.startDate
    ? format(new Date(event.startDate), 'h:mm a')
    : 'Time TBA';

  const formattedLocation = event?.location || 'Location TBA';

  if (!event?.id) {
    return null;
  }

  return (
    <Link href={`/events/${event.platform}/${event.id}`}>
      <div 
        className="h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[16/9]">
          <Image
            src={event.imageUrl || '/event-placeholder.jpg'}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div 
            className={`absolute top-2 right-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <SaveEventButton
              eventId={event.id}
              eventData={event}
              className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 transition-all duration-200 shadow-sm"
              iconClassName="w-5 h-5"
            />
          </div>
          <div className="absolute bottom-2 left-2">
            <span
              className={`inline-block px-2 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full
                ${event.platform === 'skiddle' ? 'bg-purple-500/80' :
                  event.platform === 'eventbrite' ? 'bg-orange-500/80' :
                    'bg-blue-500/80'
              }`}
            >
              {event.platform || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {event.title || 'Untitled Event'}
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
