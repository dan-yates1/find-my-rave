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
    <Link 
      href={`/events/${platform}/${eventId}`}
      className="group h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div 
          onClick={(e) => {
            e.preventDefault(); // Prevent Link navigation
            e.stopPropagation(); // Stop event bubbling
          }} 
          className="absolute top-2 right-2 z-10"
        >
          <BookmarkButton
            eventId={eventId}
            initialIsBookmarked={initialIsBookmarked}
            variant="default"
            size="lg"
          />
        </div>
      </div>

      <div className="flex flex-col flex-grow p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-sm text-gray-900 mb-2 sm:mb-1 line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>

        <p className="text-gray-600 text-sm mb-2 line-clamp-1">
          {formattedLocation}
        </p>

        <p className="text-gray-500 text-sm font-medium">
          {formattedDate} • {formattedTime}
        </p>
      </div>
    </Link>
  );
}
