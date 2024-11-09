"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import Map from "@/components/Map";
import { capitalizeFirstLetter, getLatLon } from "@/lib/utils";
import { CalendarIcon, FunnelIcon, XMarkIcon, MapIcon } from "@heroicons/react/24/outline";
import debounce from "lodash/debounce";
import Image from "next/image";
import { format, parse } from "date-fns";

interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  latitude?: number;
  longitude?: number;
  link: string;
  imageUrl?: string;
  price: number;
  eventType: string;
  approved: boolean;
  platform: 'skiddle' | 'eventbrite';
}

const FindEventsPageContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    priceRange: 'all',
    eventType: 'CLUB',
    radius: '30',
    customDate: '',
    platform: 'all' as 'all' | 'skiddle' | 'eventbrite',
  });
  const [centreLatLon, setCentreLatLon] = useState<[number, number]>();
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [hideMap, setHideMap] = useState(true);

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
        setLoading(true);
        const queryParams = new URLSearchParams({
          keywords: params.eventQuery,
          location: params.locationQuery,
          max_events: '10',
          ...(params.filters.platform !== 'all' && { platform: params.filters.platform }),
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events?${queryParams.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        
        // Filter results based on price if needed
        const filteredEvents = params.filters.priceRange === 'all' 
          ? data
          : data.filter((event: Event) => 
              params.filters.priceRange === 'free' ? event.price === 0 : event.price > 0
            );

        setEvents(params.page === 0 ? filteredEvents : (prev) => [...prev, ...filteredEvents]);
        setHasMore(filteredEvents.length === 10);

        if (params.page === 0 && params.locationQuery) {
          const location = await getLatLon(params.locationQuery);
          if (location) {
            setCentreLatLon([location.lat, location.lon]);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        setHasMore(false);
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
    if (!loading && hasMore) {
      setLoading(true);
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    setEvents([]);
    setPage(0);
    setHasMore(true);
  }, [eventQuery, locationQuery, filters]);

  const titleText =
    eventQuery || locationQuery
      ? `${capitalizeFirstLetter(eventQuery || "All")} events${
          locationQuery ? `, ${locationQuery}` : ""
        }`
      : "All events";

  const handleFilterChange = (
    filterType: "dateRange" | "priceRange" | "eventType" | "radius" | "platform",
    value: string
  ) => {
    setPage(0);
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
      radius: '30',
      customDate: '',
      platform: 'all',
    });
  };

  // Reset map when unmounting
  useEffect(() => {
    return () => {
      setShowMap(false);
      setMapInitialized(false);
    };
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFilters(prev => ({
      ...prev,
      dateRange: 'custom',
      customDate: date,
    }));
  };

  const DateRangeFilter = () => (
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
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateRange"
            value="custom"
            checked={filters.dateRange === 'custom'}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
            className="text-primary"
          />
          <input
            type="date"
            value={filters.customDate}
            onChange={handleDateChange}
            className={`text-sm p-1 rounded border ${
              filters.dateRange === 'custom' 
                ? 'border-blue-600' 
                : 'border-gray-300'
            }`}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
      </div>
    </div>
  );

  const RadiusFilter = () => {
    if (!locationQuery) return null;

    return (
      <div>
        <h4 className="text-sm font-medium">Search Radius (miles)</h4>
        <div className="space-y-2">
          {['10', '20', '30', '50', '100'].map((range) => (
            <label key={range} className="flex items-center space-x-2">
              <input
                type="radio"
                name="radius"
                value={range}
                checked={filters.radius === range}
                onChange={(e) => handleFilterChange("radius", e.target.value)}
                className="text-primary"
              />
              <span className="text-sm">{range} miles</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const eventTypes = ['CLUB', 'LIVE', 'FEST', 'ALL'].map(type => ({
    value: type,
    label: type === 'CLUB' ? 'Club Night' :
           type === 'LIVE' ? 'Live Music' :
           type === 'FEST' ? 'Festival' : 'All Events'
  }));

  const PlatformFilter = () => (
    <div>
      <h4 className="text-sm font-medium">Platform</h4>
      <div className="space-y-2">
        {[
          { value: 'all', label: 'All Platforms' },
          { value: 'skiddle', label: 'Skiddle' },
          { value: 'eventbrite', label: 'Eventbrite' }
        ].map(({ value, label }) => (
          <label key={value} className="flex items-center space-x-2">
            <input
              type="radio"
              name="platform"
              value={value}
              checked={filters.platform === value}
              onChange={(e) => handleFilterChange("platform", e.target.value)}
              className="text-primary"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Filters Section */}
      <div className="border-b bg-white sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setHideMap(!hideMap)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 z-50"
              >
                <MapIcon className="w-5 h-5" />
                <span>{hideMap ? 'Show Map' : 'Hide Map'}</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-4">
              <DateRangeFilter />
              <div>
                <h4 className="text-sm font-medium">Price</h4>
                <div className="space-y-2">
                  {['free', 'paid', 'all'].map((range) => (
                    <label key={range} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range}
                        checked={filters.priceRange === range}
                        onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm capitalize">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Event Type</h4>
                <div className="space-y-2">
                  {eventTypes.map(({ value, label }) => (
                    <label key={value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="eventType"
                        value={value}
                        checked={filters.eventType === value}
                        onChange={(e) => handleFilterChange("eventType", e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <PlatformFilter />
              <RadiusFilter />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Events List */}
        <div className={`flex-1 px-4 py-8 ${!hideMap ? 'pr-[40%]' : ''}`}>
          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonEventCard key={i} />
              ))
            ) : events.length > 0 ? (
              events.map((event) => (
                <div 
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <EventCard
                    event={event}
                    onHover={setHoveredEventId}
                  />
                </div>
              ))
            ) : (
              // Updated No events found message without the image
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

          {/* Load More button */}
          {hasMore && events.length > 0 && (
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

        {/* Map */}
        {!hideMap && (
          <div className="fixed top-[125px] right-0 w-[40%] bottom-0">
            <Map
              events={events}
              hoveredEventId={hoveredEventId}
              center={centreLatLon}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FindEventsPageContent;
