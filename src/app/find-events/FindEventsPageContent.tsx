"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import Map from "@/components/Map";
import { capitalizeFirstLetter, getLatLon } from "@/lib/utils";

const FindEventsPageContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state
  const [centreLatLon, setCentreLatLon] = useState<number[]>();
  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await fetch(
          `/api/events/search?event=${eventQuery}&location=${locationQuery}`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
          const location = await getLatLon(locationQuery);
          if (location) {
            setCentreLatLon([location.lat, location.lon]);
          } else {
            console.error("Failed to fetch location");
          }
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchEvents();
  }, [eventQuery, locationQuery]);

  const titleText =
    eventQuery || locationQuery
      ? `${capitalizeFirstLetter(eventQuery || "All")} events${
          locationQuery ? `, ${locationQuery}` : ""
        }`
      : "All events";

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Event List */}
      <div className="lg:w-1/2 overflow-y-auto p-6 space-y-4 w-full">
        <h2 className="text-3xl font-bold mb-4">{titleText}</h2>
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, index) => <SkeletonEventCard key={index} />) // Render 6 skeleton cards
        ) : events.length > 0 ? (
          events.map((event) => <EventCard key={event.id} event={event} />) // Render events
        ) : (
          <p className="text-lg text-gray-600">No events found.</p> // Display message when no events are found
        )}
        {<div id="bottom-element" className="h-8"></div>}
      </div>

      {/* Map Area - Only render on large screens */}
      <div className="hidden lg:block lg:w-1/2 p-4">
        <Map events={events} />
      </div>
    </div>
  );
};

export default FindEventsPageContent;
