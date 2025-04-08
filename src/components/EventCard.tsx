"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import BookmarkButton from "./BookmarkButton";

interface EventCardProps {
  event: any; // Skiddle event or bookmark snapshot
  initialIsBookmarked?: boolean;
}

export default function EventCard({ event, initialIsBookmarked = false }: EventCardProps) {
  const router = useRouter();

  if (!event) return null;

  const eventId = event.id;
  const platform = event.platform || "skiddle";
  const title = event.title || "Untitled Event";
  const imageUrl = event.imageUrl || "/placeholder-event.jpg";
  const location = event.location || "Location TBA";

  const formattedDate = event.startDate
    ? format(new Date(event.startDate), "EEE, MMM d, yyyy")
    : "Date TBA";

  const formattedTime = event.startDate
    ? format(new Date(event.startDate), "h:mm a")
    : "Time TBA";

  return (
    <Link
      href={`/events/${platform}/${eventId}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-gray-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Bookmark button */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
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

        {/* Date badge */}
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold text-gray-800">
          {formattedDate}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-3">
        <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-1 line-clamp-1">{location}</p>
        <p className="text-gray-500 text-xs font-medium">{formattedTime}</p>
      </div>
    </Link>
  );
}
