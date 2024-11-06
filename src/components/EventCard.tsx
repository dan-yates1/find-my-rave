"use client";

import React from "react";
import { Event } from "@prisma/client";
import Image from "next/image";
import {
  MapIcon,
  TicketIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const router = useRouter();

  // Temporary price data (you can add this to your schema later)
  const priceRange = "£20 - £30";
  const ticketsLeft = Math.floor(Math.random() * 100); // Random number for demo

  // Format the date nicely
  const formattedDate = new Date(event.startDate).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const formattedTime = new Date(event.startDate).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => router.push(`/events/${event.slug}`)}
      className="group relative overflow-hidden rounded-2xl hover-effect glass-effect border border-gray-200/20 dark:border-gray-700/20 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Image Container */}
        <div className="relative w-full md:w-48 h-48 md:h-32 overflow-hidden rounded-xl">
          <Image
            src={event.imageUrl || "/rave-bg.jpg"}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-500 group-hover:text-blue-600transition-colors">
                {event.title}
              </h3>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {ticketsLeft} tickets left
              </span>
            </div>

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
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <UsersIcon className="w-4 h-4" />
                {Math.floor(Math.random() * 500)} attending
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                From {priceRange}
              </span>
              {/* {ticketsLeft < 20 && (
                <span className="text-xs text-red-500 dark:text-red-400 font-medium px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                  Selling fast
                </span>
              )} */}
            </div>
            <span className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
              <TicketIcon className="w-4 h-4" />
              View Details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
