import React from "react";
import { Event } from "@prisma/client";
import Image from "next/image";
import { MapIcon, TicketIcon } from "@heroicons/react/24/outline";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    // hover:shadow-outline-lg transition-shadow duration-300 ease-in-out
    <div className="flex space-x-4 p-4 border-b border-gray-300"> 
      {/* Event Image */}
      <Image
        src="/placeholder.png"
        width={100}
        height={100}
        alt={event.title}
        className="w-52 h-28 rounded-lg object-cover"
      />

      {/* Event Details */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="text-gray-500">
          {new Date(event.startDate).toLocaleString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex items-center space-x-2 gap-5 text-blue-600">
          <span className="flex items-center gap-1">
            <MapIcon className="w-5 h-5 text-blue-600" />
            {event.location}
          </span>
          <a href={event.link} className="flex items-center gap-1">
            <TicketIcon className="w-5 h-5 text-blue-600" />
            Tickets
          </a>
        </div>
      </div>

      {/* Bookmark Icon */}
      <div className="text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 3v18l7-5 7 5V3z"
          />
        </svg>
      </div>
    </div>
  );
};

export default EventCard;
