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
  customDate?: string;
  sortBy?: 'date' | 'relevance';
}

const dateFilterOptions = [
  { label: 'Any time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This week', value: 'this-week' },
  { label: 'This weekend', value: 'weekend' },
  { label: 'Custom date', value: 'custom' }
];

const FindEventsPageContent = () => {
  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    platform: 'all',
    dateRange: 'all',
    priceRange: 'all',
    customDate: '',
    sortBy: 'date',
  });
  const [allEvents, setAllEvents] = useState<ExtendedEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<ExtendedEvent[]>([]);
  const [hasMoreLocal, setHasMoreLocal] = useState(false);
  const eventsPerPage = 12;
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Update queries when URL params change or filters change
  const { data, isLoading, error } = useQuery({
    queryKey: ['events', searchParams.toString(), filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        event: eventQuery,
        location: locationQuery,
        skip: "0",
        limit: "36",
        ...(filters.platform !== 'all' && { platform: filters.platform }),
        ...(filters.dateRange !== 'all' && { dateRange: filters.dateRange }),
        ...(filters.customDate && { customDate: filters.customDate }),
        ...(filters.priceRange !== 'all' && { priceRange: filters.priceRange })
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
    gcTime: 1000 * 60 * 30, // 30 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update events when data changes
  useEffect(() => {
    if (data?.events) {
      setAllEvents(data.events);
      setDisplayedEvents(data.events.slice(0, eventsPerPage));
      setHasMoreLocal(data.events.length > eventsPerPage);
    }
  }, [data]);

  // Reset events when search params change
  useEffect(() => {
    setAllEvents([]);
    setDisplayedEvents([]);
    setHasMoreLocal(false);
  }, [searchParams]);

  // Handle "Show More" click
  const handleShowMore = () => {
    const nextEvents = allEvents.slice(0, displayedEvents.length + eventsPerPage);
    setDisplayedEvents(nextEvents);
    setHasMoreLocal(nextEvents.length < allEvents.length);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Update filters when date option changes
  const handleDateFilterChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      handleFilterChange('dateRange', value);
    }
  };

  const titleText = eventQuery || locationQuery
    ? `${capitalizeFirstLetter(eventQuery || "All")} events${locationQuery ? ` in ${locationQuery}` : ""}`
    : "All events";

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none border-b bg-white shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{titleText}</h1>
            <button
              onClick={toggleFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-full border border-gray-200 shadow-sm transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{isFiltersVisible ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-full">
            {/* Filters Sidebar */}
            {isFiltersVisible && (
              <div className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-lg shadow-sm mt-6 h-fit">
                <div className="p-6 space-y-6">
                  {/* Date Filter */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Date</h3>
                    <div className="space-y-3">
                      {dateFilterOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 text-gray-600 hover:text-gray-900"
                        >
                          <input
                            type="radio"
                            name="dateFilter"
                            value={option.value}
                            checked={filters.dateRange === option.value}
                            onChange={(e) => handleDateFilterChange(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Custom Date Input */}
                    {showCustomDate && (
                      <input
                        type="date"
                        value={filters.customDate}
                        onChange={(e) => handleFilterChange('customDate', e.target.value)}
                        className="mt-3 w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Price Range</h3>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">Any price</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Events Grid */}
            <div 
              className={`flex-1 ${isFiltersVisible ? 'lg:ml-8' : ''} overflow-y-auto scrollbar-hide`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {isLoading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonEventCard key={i} />
                  ))
                ) : displayedEvents.length > 0 ? (
                  displayedEvents.map((event) => (
                    <div key={event.id} className="h-full">
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
              {hasMoreLocal && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={handleShowMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Show More Events
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindEventsPageContent;
