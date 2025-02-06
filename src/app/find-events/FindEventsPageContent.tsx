"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { capitalizeFirstLetter } from "@/lib/utils";
import { FunnelIcon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Event } from "@prisma/client";
import { GENRE_MAPPINGS } from "@/lib/constants";
import { useRouter } from "next/navigation";

// Extend the Event type to include platform
interface ExtendedEvent extends Event {
  platform: string;
}

interface Filters {
  platform: string;
  dateRange?: string;
  priceRange?: string;
  customDate?: string;
  sortBy?: "date" | "relevance";
  genre: string;
}

interface EventsResponse {
  events: ExtendedEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}

const dateFilterOptions = [
  { label: "Any time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "this-week" },
  { label: "This weekend", value: "weekend" },
  { label: "Custom date", value: "custom" },
];

const fetchEvents = async (searchParams: URLSearchParams) => {
  const response = await fetch(`/api/events/search?${searchParams.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch events');
  }
  return response.json();
};

const FindEventsPageContent = () => {
  const searchParams = useSearchParams();
  const eventQuery = searchParams.get("event") || "";
  const locationQuery = searchParams.get("location") || "";
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    platform: "all",
    dateRange: "all",
    priceRange: "all",
    customDate: "",
    sortBy: "date",
    genre: "all",
  });
  const [allEvents, setAllEvents] = useState<ExtendedEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<ExtendedEvent[]>([]);
  const [hasMoreLocal, setHasMoreLocal] = useState(false);
  const eventsPerPage = 12;
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const router = useRouter();

  // Add new state for pending filters
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    platform: "all",
    dateRange: "all",
    priceRange: "all",
    customDate: "",
    sortBy: "date",
    genre: "all",
  });

  // Add new state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    date: true,
    genre: true,
  });

  // Update queries when URL params change or filters change
  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ["events", filters, eventQuery, locationQuery, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(eventQuery && { event: eventQuery }),
        ...(locationQuery && { location: locationQuery }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.customDate && { customDate: filters.customDate }),
        ...(filters.genre && filters.genre !== "all" && { genre: filters.genre }),
        page: currentPage.toString(),
        limit: eventsPerPage.toString(),
      });
      return fetchEvents(params);
    },
    placeholderData: keepPreviousData // Use placeholderData instead of keepPreviousData
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update the filter handlers
  const handlePendingFilterChange = (key: keyof Filters, value: string) => {
    setPendingFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset customDate if dateRange is changed and it's not custom
      ...(key === 'dateRange' && value !== 'custom' ? { customDate: '' } : {})
    }));
  };

  // Update date filter handler
  const handlePendingDateFilterChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDate(true);
      setPendingFilters(prev => ({
        ...prev,
        dateRange: value
      }));
    } else {
      setShowCustomDate(false);
      setPendingFilters(prev => ({
        ...prev,
        dateRange: value,
        customDate: '' // Clear custom date when selecting a preset date range
      }));
    }
  };

  // Add apply filters function
  const applyFilters = () => {
    setFilters(pendingFilters);
    setIsMobileFiltersOpen(false);
    setCurrentPage(1); // Reset to first page when applying new filters
  };

  const titleText =
    eventQuery || locationQuery
      ? `${capitalizeFirstLetter(eventQuery || "All")} events${
          locationQuery ? ` in ${locationQuery}` : ""
        }`
      : "All events";

  const toggleFilters = () => {
    // Prevent body scroll when filter menu is open
    if (!isFiltersVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setIsFiltersVisible(!isFiltersVisible);
  };

  useEffect(() => {
    if (data?.events) {
      console.log("Events data:", data.events);
    }
  }, [data]);

  // Add toggle function
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Add reset filters function at the component level
  const resetFilters = () => {
    setPendingFilters({
      platform: "all",
      dateRange: "all",
      priceRange: "all",
      customDate: "",
      sortBy: "date",
      genre: "all",
    });
    setShowCustomDate(false);
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Reset body scroll when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Add this effect to handle body scroll for mobile filters
  useEffect(() => {
    document.body.style.overflow = isMobileFiltersOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileFiltersOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile filter dialog */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300 ${
          isMobileFiltersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileFiltersOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-md transform transition-transform duration-300 ease-in-out ${
          isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Filters Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Date Filter */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('date')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Date
                  </h3>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.date ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.date && (
                  <div className="space-y-3 pt-2">
                    {dateFilterOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                      >
                        <input
                          type="radio"
                          name="dateFilter-mobile"
                          value={option.value}
                          checked={pendingFilters.dateRange === option.value}
                          onChange={(e) => handlePendingDateFilterChange(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                    
                    {/* Custom Date Input */}
                    {showCustomDate && (
                      <input
                        type="date"
                        value={pendingFilters.customDate}
                        onChange={(e) => handlePendingFilterChange("customDate", e.target.value)}
                        className="mt-3 w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Genre Filter */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('genre')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Genre
                  </h3>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.genre ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.genre && (
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2">
                      <input
                        type="radio"
                        name="genreFilter-mobile"
                        value="all"
                        checked={pendingFilters.genre === "all"}
                        onChange={(e) => handlePendingFilterChange("genre", e.target.value)}
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
                          name="genreFilter-mobile"
                          value={code}
                          checked={pendingFilters.genre === code}
                          onChange={(e) => handlePendingFilterChange("genre", e.target.value)}
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show Results Button - Fixed at bottom */}
          <div className="border-t p-4 bg-white">
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update mobile filter toggle button position */}
      <div className="lg:hidden fixed bottom-6 left-6 z-30">
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
            <div 
              className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                isFiltersVisible ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button
                      onClick={() => setIsFiltersVisible(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filters Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Date Filter */}
                    <div className="space-y-4">
                      <button
                        onClick={() => toggleSection('date')}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Date
                        </h3>
                        <ChevronDownIcon 
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            expandedSections.date ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {expandedSections.date && (
                        <div className="space-y-3 pt-2">
                          {dateFilterOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                            >
                              <input
                                type="radio"
                                name="dateFilter-desktop"
                                value={option.value}
                                checked={pendingFilters.dateRange === option.value}
                                onChange={(e) => handlePendingDateFilterChange(e.target.value)}
                                className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                              />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          ))}
                          
                          {/* Custom Date Input */}
                          {showCustomDate && (
                            <input
                              type="date"
                              value={pendingFilters.customDate}
                              onChange={(e) => handlePendingFilterChange("customDate", e.target.value)}
                              className="mt-3 w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Genre Filter */}
                    <div className="space-y-4">
                      <button
                        onClick={() => toggleSection('genre')}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          Genre
                        </h3>
                        <ChevronDownIcon 
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            expandedSections.genre ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {expandedSections.genre && (
                        <div className="space-y-3 pt-2">
                          <label className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2">
                            <input
                              type="radio"
                              name="genreFilter-desktop"
                              value="all"
                              checked={pendingFilters.genre === "all"}
                              onChange={(e) => handlePendingFilterChange("genre", e.target.value)}
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
                                name="genreFilter-desktop"
                                value={code}
                                checked={pendingFilters.genre === code}
                                onChange={(e) => handlePendingFilterChange("genre", e.target.value)}
                                className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                              />
                              <span className="text-sm">{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with Buttons - Fixed */}
                <div className="border-t p-4 bg-white">
                  <div className="flex gap-3">
                    <button
                      onClick={resetFilters}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => {
                        applyFilters();
                        setIsFiltersVisible(false);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Show Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
              isFiltersVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => {
              setIsFiltersVisible(false);
              document.body.style.overflow = 'unset';
            }}
          />

          {/* Events Section */}
          <div className="flex-1">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>
              {!isFiltersVisible && (
                <button
                  onClick={() => setIsFiltersVisible(true)}
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm 
                  text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 
                  font-medium group"
                >
                  <FunnelIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  <span>Filters</span>
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
              ) : data?.events?.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No events found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We couldn&apos;t find any events matching your criteria.
                      Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={() => {
                        // Reset filters
                        setFilters({
                          platform: "",
                          dateRange: "",
                          priceRange: "",
                          customDate: "",
                          sortBy: "date",
                          genre: "",
                        });
                        // Clear search params
                        router.push("/find-events");
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              ) : (
                data?.events?.map((event: ExtendedEvent) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>

            {/* Pagination */}
            {data && data.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
