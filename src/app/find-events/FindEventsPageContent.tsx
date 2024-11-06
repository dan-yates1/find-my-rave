"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import Map from "@/components/Map";
import { capitalizeFirstLetter, getLatLon } from "@/lib/utils";
import { CalendarIcon, FunnelIcon, XMarkIcon, MapIcon } from "@heroicons/react/24/outline";
import debounce from "lodash/debounce";

const FindEventsPageContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    priceRange: 'all',
    eventType: 'all',
  });
  const [centreLatLon, setCentreLatLon] = useState<[number, number]>();
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (params: {
      eventQuery: string;
      locationQuery: string;
      filters: typeof filters;
      page: number;
    }) => {
      try {
        const queryParams = new URLSearchParams({
          event: params.eventQuery,
          location: params.locationQuery,
          dateRange: params.filters.dateRange,
          priceRange: params.filters.priceRange,
          eventType: params.filters.eventType,
          page: params.page.toString(),
          limit: "10",
        });

        const response = await fetch(`/api/events/search?${queryParams}`);
        
        if (response.ok) {
          const data = await response.json();
          setEvents(params.page === 0 ? data.events : (prev) => [...prev, ...data.events]);
          setHasMore(data.hasMore);
          if (params.page === 0) {
            const location = await getLatLon(params.locationQuery);
            if (location) {
              setCentreLatLon([location.lat, location.lon]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Effect to trigger fetches
  useEffect(() => {
    setLoading(true);
    debouncedFetch({ eventQuery, locationQuery, filters, page });

    return () => {
      debouncedFetch.cancel();
    };
  }, [eventQuery, locationQuery, filters, page, debouncedFetch]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    setPage(0);
  }, [eventQuery, locationQuery, filters]);

  const titleText =
    eventQuery || locationQuery
      ? `${capitalizeFirstLetter(eventQuery || "All")} events${
          locationQuery ? `, ${locationQuery}` : ""
        }`
      : "All events";

  const handleFilterChange = (
    filterType: "dateRange" | "priceRange" | "eventType",
    value: string
  ) => {
    setPage(0); // Reset to first page when filters change
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      priceRange: 'all',
      eventType: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="flex flex-col lg:flex-row max-w-[2000px] mx-auto relative">
        {/* Mobile Filters */}
        <div 
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
            showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Filters Panel */}
          <div 
            className={`absolute inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              showFilters ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-full overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-8">
                {/* Date Filter */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date Range
                  </h4>
                  <div className="space-y-2">
                    {['Today', 'This Week', 'This Month', 'All'].map((range) => (
                      <label key={range} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="dateRange"
                          value={range.toLowerCase()}
                          checked={filters.dateRange === range.toLowerCase()}
                          onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-sm">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Event Type Filter */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Event Type</h4>
                  <div className="space-y-2">
                    {['Techno', 'House', 'Drum & Bass', 'All'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="eventType"
                          value={type.toLowerCase()}
                          checked={filters.eventType === type.toLowerCase()}
                          onChange={(e) => handleFilterChange("eventType", e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Price Range</h4>
                  <div className="space-y-2">
                    {['Free', '£0-£20', '£20-£50', '£50+', 'All'].map((range) => (
                      <label key={range} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.toLowerCase()}
                          checked={filters.priceRange === range.toLowerCase()}
                          onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-sm">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={resetFilters}
                className="text-sm text-primary hover:text-primary/80"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block lg:w-80 p-6 border-r border-gray-200/30">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button 
                onClick={() => setFilters({
                  dateRange: 'all',
                  priceRange: 'all',
                  eventType: 'all',
                })}
                className="text-sm text-primary hover:text-primary/80"
              >
                Reset
              </button>
            </div>

            <div className="space-y-8">
              {/* Date Filter */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date Range
                </h4>
                <div className="space-y-2">
                  {['Today', 'This Week', 'This Month', 'All'].map((range) => (
                    <label key={range} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="dateRange"
                        value={range.toLowerCase()}
                        checked={filters.dateRange === range.toLowerCase()}
                        onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Event Type Filter */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Event Type</h4>
                <div className="space-y-2">
                  {['Techno', 'House', 'Drum & Bass', 'All'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="eventType"
                        value={type.toLowerCase()}
                        checked={filters.eventType === type.toLowerCase()}
                        onChange={(e) => handleFilterChange("eventType", e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Price Range</h4>
                <div className="space-y-2">
                  {['Free', '£0-£20', '£20-£50', '£50+', 'All'].map((range) => (
                    <label key={range} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range.toLowerCase()}
                        checked={filters.priceRange === range.toLowerCase()}
                        onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden p-4 border-b">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Events List */}
          <div className="p-6 lg:p-8 pb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {titleText}
            </h2>
            
            <div className="grid gap-6">
              {loading ? (
                Array(3).fill(0).map((_, index) => (
                  <SkeletonEventCard key={index} />
                ))
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No events found</p>
                </div>
              ) : (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onHover={setHoveredEventId}
                  />
                ))
              )}
            </div>
            {hasMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Show More Events'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="hidden xl:block w-[40%] max-w-[600px] h-[calc(100vh-5rem)] sticky top-16 right-0 p-4">
          <div className="relative h-full rounded-xl overflow-hidden shadow-xl border border-gray-200/20">
            {!showMap ? (
              <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white">
                <h3 className="text-xl font-semibold">Interactive Map</h3>
                <p className="text-sm text-gray-300 text-center max-w-sm">
                  View all events on an interactive map. This may use additional data.
                </p>
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapIcon className="w-5 h-5" />
                  Load Map
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <Map 
                  events={events} 
                  centreLatLon={centreLatLon}
                  hoveredEventId={hoveredEventId}
                  className="w-full h-full"
                />
              </div>
            )}
            
            {/* Loading Overlay */}
            {loading && showMap && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm rounded-xl">
                <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg">
                  <div className="text-sm font-medium">Loading events...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindEventsPageContent;
