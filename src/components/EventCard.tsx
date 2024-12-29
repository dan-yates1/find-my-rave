"use client";

import React, { useState, useEffect } from "react";
import { Event } from "@prisma/client";
import Image from "next/image";
import {
  MapIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import BookmarkButton from "./BookmarkButton";
import { useSession } from "next-auth/react";

interface EventCardProps {
  event: Event & {
    platform?: string;
  };
  onHover?: (id: string | null) => void;
}

export default function EventCard({ event, onHover }: EventCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { data: session } = useSession();

  // Check if event is bookmarked on component mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/bookmarks/check/${event.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [event.id, session?.user?.email]);

  const formattedDate = event?.startDate
    ? format(new Date(event.startDate), "EEE, MMM d, yyyy")
    : "Date TBA";

  const formattedTime = event?.startDate
    ? format(new Date(event.startDate), "h:mm a")
    : "Time TBA";

  const formattedLocation = event?.location || "Location TBA";

  if (!event?.id) {
    return null;
  }

  return (
    <Link
      href={`/events/${event.platform || 'skiddle'}/${event.id}`}
      className="group relative block h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      onMouseEnter={() => onHover?.(event.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div
        className="h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
      >
        <div className="relative aspect-[16/9]">
          <Image
            src={event.imageUrl || "/event-placeholder.jpg"}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized={true}
          />
          <div className="absolute right-4 top-4 z-10">
            <BookmarkButton
              eventId={event.id}
              initialIsBookmarked={isBookmarked}
              variant="card"
            />
          </div>
          {/* <div className="absolute bottom-2 left-2">
            <span
              className={`inline-block px-2 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full
                ${event.platform === 'skiddle' ? 'bg-purple-500/80' :
                  event.platform === 'eventbrite' ? 'bg-orange-500/80' :
                    'bg-blue-500/80'
              }`}
            >
              {event.platform || 'Unknown'}
            </span>
          </div> */}
        </div>

        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {event.title || "Untitled Event"}
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
