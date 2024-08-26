import React from "react";
import { Event } from "@prisma/client";
import Image from "next/image";
import { BookmarkIcon, MapIcon, TicketIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link href={`/events/${event.slug}`}>
      {/* hover:shadow-outline-lg transition-shadow duration-300 ease-in-out */}
      <div className="flex space-x-4 p-4 rounded-xl mb-6 hover:shadow-outline-lg transition-shadow duration-300 ease-in-out">
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
        <div className="ml-auto flex items-center">
          <div className="p-2 rounded-full hover:bg-blue-100 transition-colors duration-300">
            <BookmarkIcon className="h-6 w-6 text-blue-500 hover:text-blue-700" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
