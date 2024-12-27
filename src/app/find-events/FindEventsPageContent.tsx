"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { capitalizeFirstLetter } from "@/lib/utils";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useQuery } from '@tanstack/react-query';
import { Event } from "@prisma/client";
import { GENRE_MAPPINGS } from '@/lib/constants';

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
  genre: string;
}

interface EventsResponse {
  events: ExtendedEvent[];
  hasMore: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
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
    genre: 'all',
  });
  const [allEvents, setAllEvents] = useState<ExtendedEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<ExtendedEvent[]>([]);
  const [hasMoreLocal, setHasMoreLocal] = useState(false);
  const eventsPerPage = 12;
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Update queries when URL params change or filters change
  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ['events', searchParams.toString(), filters, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        event: eventQuery,
        location: locationQuery,
        skip: ((currentPage - 1) * eventsPerPage).toString(),
        limit: eventsPerPage.toString(),
        ...(filters.platform !== 'all' && { platform: filters.platform }),
        ...(filters.dateRange !== 'all' && { dateRange: filters.dateRange }),
        ...(filters.customDate && { customDate: filters.customDate }),
        ...(filters.priceRange !== 'all' && { priceRange: filters.priceRange })
      });

      const response = await fetch(`/api/events/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
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
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  useEffect(() => {
    if (data?.events) {
      console.log('Events data:', data.events);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile filter dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300 ${
          isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileFiltersOpen(false)}
      />
      
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Date Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Date
              </h3>
              <div className="space-y-3">
                {dateFilterOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                  >
                    <input
                      type="radio"
                      name="dateFilter"
                      value={option.value}
                      checked={filters.dateRange === option.value}
                      onChange={(e) => {
                        handleDateFilterChange(e.target.value);
                      }}
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

            {/* Genre Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Genre
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2">
                  <input
                    type="radio"
                    name="genreFilter"
                    value="all"
                    checked={filters.genre === 'all'}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-sm">All Genres</span>
                </label>
                {Object.entries(GENRE_MAPPINGS).map(([code, { label }]) => (
                  <label
                    key={code}
                    className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                  >
                    <input
                      type="radio"
                      name="genreFilter"
                      value={code}
                      checked={filters.genre === code}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="sticky bottom-0 bg-white p-4 border-t">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <FunnelIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className={`flex gap-8`}>
          {/* Desktop Filters */}
          {isFiltersVisible && (
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  {/* Desktop Filter Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button
                      onClick={() => setIsFiltersVisible(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Content */}
                  <div className="space-y-6">
                    {/* Date Filter */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Date
                      </h3>
                      <div className="space-y-3">
                        {dateFilterOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                          >
                            <input
                              type="radio"
                              name="dateFilter"
                              value={option.value}
                              checked={filters.dateRange === option.value}
                              onChange={(e) => {
                                handleDateFilterChange(e.target.value);
                              }}
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

                    {/* Genre Filter */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Genre
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2">
                          <input
                            type="radio"
                            name="genreFilter"
                            value="all"
                            checked={filters.genre === 'all'}
                            onChange={(e) => handleFilterChange('genre', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm">All Genres</span>
                        </label>
                        {Object.entries(GENRE_MAPPINGS).map(([code, { label }]) => (
                          <label
                            key={code}
                            className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                          >
                            <input
                              type="radio"
                              name="genreFilter"
                              value={code}
                              checked={filters.genre === code}
                              onChange={(e) => handleFilterChange('genre', e.target.value)}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Section */}
          <div className="flex-1">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>
              {!isFiltersVisible && (
                <button
                  onClick={() => setIsFiltersVisible(true)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-gray-700"
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span>Show Filters</span>
                </button>
              )}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonEventCard key={i} />
                ))
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Error loading events
                  </h3>
                  <p className="text-gray-600">
                    An error occurred while loading events.
                  </p>
                </div>
              ) : (
                data?.events?.map((event: ExtendedEvent) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {data.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindEventsPageContent;
