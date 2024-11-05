"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import Map from "@/components/Map";
import { capitalizeFirstLetter, getLatLon } from "@/lib/utils";
import { CalendarIcon, FunnelIcon } from "@heroicons/react/24/outline";

const FindEventsPageContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    priceRange: 'all',
    eventType: 'all',
  });
  const [centreLatLon, setCentreLatLon] = useState<[number, number]>();

  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
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
        setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="flex flex-col lg:flex-row max-w-[2000px] mx-auto">
        {/* Sidebar with Filters */}
        <div className="lg:w-80 p-6 border-r border-gray-200/30">
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

            {/* Date Filter */}
            <div className="space-y-4 mb-8">
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
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                      className="text-primary"
                    />
                    <span className="text-sm">{range}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-medium">Event Type</h4>
              <div className="space-y-2">
                {['Techno', 'House', 'Drum & Bass', 'All'].map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="eventType"
                      value={type.toLowerCase()}
                      checked={filters.eventType === type.toLowerCase()}
                      onChange={(e) => setFilters({...filters, eventType: e.target.value})}
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
                      onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                      className="text-primary"
                    />
                    <span className="text-sm">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden p-4 border-b">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Events List */}
          <div className="p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {titleText}
            </h2>
            
            <div className="grid gap-6">
              {loading ? (
                Array(6).fill(0).map((_, index) => (
                  <SkeletonEventCard key={index} />
                ))
              ) : events.length > 0 ? (
                events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No events found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="hidden xl:block w-[600px] h-screen sticky top-0">
          <Map events={events} />
        </div>
      </div>
    </div>
  );
};

export default FindEventsPageContent;
