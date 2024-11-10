"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { capitalizeFirstLetter } from "@/lib/utils";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { useQuery } from '@tanstack/react-query';
import { Event } from "@prisma/client";

// Extend the Event type to include platform
interface ExtendedEvent extends Event {
  platform: string;
}

interface Filters {
  platform: string;
  dateRange?: string;
  priceRange?: string;
  eventType?: string;
  radius?: string;
  customDate?: string;
  sortBy?: 'date' | 'relevance';
}

const FindEventsPageContent = () => {
  const searchParams = useSearchParams();
  const [eventQuery, setEventQuery] = useState(searchParams.get("event") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    platform: 'all',
    dateRange: 'all',
    priceRange: 'all',
    eventType: 'all',
    radius: '30',
    customDate: '',
    sortBy: 'date',
  });
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [page, setPage] = useState(1);

  // Add this effect to update queries when URL params change
  useEffect(() => {
    const newEventQuery = searchParams.get("event") || "";
    const newLocationQuery = searchParams.get("location") || "";
    
    if (newEventQuery !== eventQuery || newLocationQuery !== locationQuery) {
      setEventQuery(newEventQuery);
      setLocationQuery(newLocationQuery);
      setEvents([]); // Clear existing events
      setPage(1); // Reset to first page
    }
  }, [searchParams, eventQuery, locationQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', eventQuery, locationQuery, filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        event: eventQuery,
        location: locationQuery,
        skip: ((page - 1) * 12).toString(),
        limit: '12',
        ...(filters.platform !== 'all' && { platform: filters.platform }),
      });

      const response = await fetch(`/api/events/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      return {
        ...data,
        events: data.events as ExtendedEvent[]
      };
    },
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(eventQuery || locationQuery),
  });

  // Update events based on page
  useEffect(() => {
    if (data?.events) {
      if (page === 1) {
        setEvents(data.events);
      } else {
        setEvents(prev => [...prev, ...data.events]);
      }
    }
  }, [data, page]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const titleText = eventQuery || locationQuery
    ? `${capitalizeFirstLetter(eventQuery || "All")} events${locationQuery ? ` in ${locationQuery}` : ""}`
    : "All events";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Filters Section */}
      <div className="border-b bg-white sticky top-[65px] z-40">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>
            <div className="flex items-center gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="relevance">Sort by Relevance</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
              {/* Add your filter components here */}
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <SkeletonEventCard key={i} />
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event.id}
                className="h-full"
              >
                <EventCard
                  event={event}
                  onHover={() => {}}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find more events.
              </p>
            </div>
          )}
        </div>

        {/* Show More Button */}
        {data?.hasMore && events.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Show More Events'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindEventsPageContent;
