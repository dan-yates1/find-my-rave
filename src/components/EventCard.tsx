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

interface EventCardProps {
  event: any; // Using any for now since we're handling both Event and bookmark event details
  initialIsBookmarked?: boolean;
}

export default function EventCard({ event, initialIsBookmarked = false }: EventCardProps) {
  const router = useRouter();
  
  if (!event) {
    return null;
  }

  const eventId = event?.id;
  const formattedDate = event?.startDate
    ? format(new Date(event.startDate), "EEE, MMM d, yyyy")
    : "Date TBA";
  
  const formattedTime = event?.startDate
    ? format(new Date(event.startDate), "h:mm a")
    : "Time TBA";

  const formattedLocation = event?.location || "Location TBA";
  const imageUrl = event?.imageUrl || "/placeholder-event.jpg";
  const title = event?.title || "Untitled Event";
  const platform = event?.platform || "unknown";

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.bookmark-button')) {
      return;
    }
    router.push(`/events/${platform}/${eventId}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group"
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 z-10 bookmark-button opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <BookmarkButton
            eventId={eventId}
            initialIsBookmarked={initialIsBookmarked}
          />
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-56.25%)]">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
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
  );
}
