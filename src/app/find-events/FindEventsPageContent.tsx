"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import Map from "@/components/Map";
import { capitalizeFirstLetter } from "@/lib/utils";

const PAGE_SIZE = 5; // Number of events to load per page

const FindEventsPageContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state
  const [page, setPage] = useState<number>(0); // Current page
  const [hasMore, setHasMore] = useState<boolean>(true); // If there are more events to load
  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";

  useEffect(() => {
    const fetchEvents = async (pageNum: number) => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await fetch(
          `/api/events/search?event=${eventQuery}&location=${locationQuery}&page=${pageNum}&limit=${PAGE_SIZE}`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(prevEvents => [...prevEvents, ...data.events]); // Append new events
          setHasMore(data.hasMore); // Update hasMore based on the response
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchEvents(page);
  }, [eventQuery, locationQuery, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    const bottomElement = document.getElementById('bottom-element');
    if (bottomElement) observer.observe(bottomElement);

    return () => {
      if (bottomElement) observer.unobserve(bottomElement);
    };
  }, [hasMore]);

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
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => <SkeletonEventCard key={index} />) // Render 6 skeleton cards
          : events.map((event) => <EventCard key={event.id} event={event} />)}
        {hasMore && <div id="bottom-element" className="h-8"></div>}
      </div>

      {/* Map Area - Only render on large screens */}
      <div className="hidden lg:block lg:w-1/2 p-4">
        <Map events={events} />
      </div>
    </div>
  );
};

export default FindEventsPageContent;
