"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import Map from "@/components/Map";
import { capitalizeFirstLetter } from "@/lib/utils";

const FindEventsPage = () => {
  const [events, setEvents] = useState([]);
  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `/api/events/search?event=${eventQuery}&location=${locationQuery}`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [eventQuery, locationQuery]);

  const titleText = eventQuery
    ? `${capitalizeFirstLetter(eventQuery)} events${
        locationQuery !== "Worldwide" ? `, ${locationQuery}` : ""
      }`
    : `All events${locationQuery !== "Worldwide" ? `, ${locationQuery}` : ""}`;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Event List */}
      <div className="lg:w-1/2 overflow-y-auto p-6 space-y-4 w-full">
        <h2 className="text-3xl font-bold mb-4">{titleText}</h2>
        {events.map((event: any) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Map Area - Only render on large screens */}
      <div className="hidden lg:block lg:w-1/2 p-4">
        <Map events={events} />
      </div>
    </div>
  );
};

export default FindEventsPage;
