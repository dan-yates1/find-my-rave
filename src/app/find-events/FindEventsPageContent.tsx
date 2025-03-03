"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FunnelIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { GENRE_MAPPINGS } from "@/lib/constants";
import ActiveFiltersBadges from "@/components/ActiveFiltersBadges";
import { Event, EventsResponse } from "@/types/event";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { capitalizeFirstLetter } from "@/lib/utils";

// Define ExtendedEvent interface that extends Event from our types
interface ExtendedEvent extends Event {
  // Any additional properties specific to your application
  platform: string;
}

interface Filters {
  platform: string;
  dateRange?: string;
  priceRange?: string;
  customDate?: string;
  minDate?: string;
  maxDate?: string;
  genre: string;
}

const dateFilterOptions = [
  { label: "Any time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "this-week" },
  { label: "This weekend", value: "weekend" },
  { label: "Custom date", value: "custom" },
];

const platformOptions = [
  { label: "All platforms", value: "all" },
  { label: "Skiddle", value: "skiddle" },
  { label: "Resident Advisor", value: "resident-advisor" },
  { label: "Dice", value: "dice" },
];

const genreOptions = [
  { label: "All genres", value: "all" },
  { label: "House", value: "house" },
  { label: "Techno", value: "techno" },
  { label: "Drum & Bass", value: "dnb" },
  { label: "Trance", value: "trance" },
  { label: "Dubstep", value: "dubstep" },
  { label: "Garage", value: "garage" },
  { label: "Hardstyle", value: "hardstyle" },
  { label: "Electronic", value: "electronic" },
];

const sortByOptions = [
  { label: "Trending", value: "trending" },
  { label: "Date", value: "date" },
  { label: "Best Selling", value: "bestselling" },
  { label: "Most Popular", value: "goingto" },
];

const fetchEvents = async (searchParams: URLSearchParams) => {
  // Use the new combined endpoint
  const response = await fetch(
    `/api/events/combined?${searchParams.toString()}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch events");
  }
  return response.json();
};

const transformFiltersToObject = (filters: Filters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([key, value]) => value && value !== "all")
  );
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
    minDate: "",
    maxDate: "",
    genre: "all",
  });
  const [allEvents, setAllEvents] = useState<ExtendedEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<ExtendedEvent[]>([]);
  const [hasMoreLocal, setHasMoreLocal] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const eventsPerPage = 12;
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const router = useRouter();

  // Add new state for pending filters
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    platform: "all",
    dateRange: "all",
    priceRange: "all",
    customDate: "",
    minDate: "",
    maxDate: "",
    genre: "all",
  });

  // Add state for sortBy separate from filters
  const [sortBy, setSortBy] = useState<string>("trending");
  const [pendingSortBy, setPendingSortBy] = useState<string>("trending");

  // Add new state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    date: true,
    genre: true,
    platform: true,
  });

  // Add new state for active filters
  const [activeFilters, setActiveFilters] = useState<Filters>({
    platform: "all",
    dateRange: "all",
    priceRange: "all",
    customDate: "",
    minDate: "",
    maxDate: "",
    genre: "all",
  });

  const prevSearchParams = React.useRef(searchParams.toString());

  // Update queries when URL params change or filters change
  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ["events", filters, sortBy, eventQuery, locationQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(eventQuery && { event: eventQuery }),
        ...(locationQuery && { location: locationQuery }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.customDate && { customDate: filters.customDate }),
        ...(filters.minDate && { minDate: filters.minDate }),
        ...(filters.maxDate && { maxDate: filters.maxDate }),
        ...(sortBy && { order: sortBy }),
        ...(filters.genre &&
          filters.genre !== "all" && { genre: filters.genre }),
        limit: eventsPerPage.toString(), // Just fetch one page at a time
      });
      return fetchEvents(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Update events when data changes
  useEffect(() => {
    if (data?.events) {
      console.log("Data events received:", data.events.length);

      // Store all events from the API
      setAllEvents(data.events);

      // Display all events we got from this page
      setDisplayedEvents(data.events);

      // Set hasMoreLocal based on the pagination info from the API
      const hasMore = data.pagination.hasMore;
      console.log("Setting hasMoreLocal to:", hasMore);
      setHasMoreLocal(hasMore);
    }
  }, [data]);

  // Reset events when search params change
  useEffect(() => {
    // Only reset if the search parameters have actually changed
    // Don't reset just because of page changes
    if (searchParams.toString() !== prevSearchParams.current) {
      console.log("Search params changed, resetting events");
      setAllEvents([]);
      setDisplayedEvents([]);
      setHasMoreLocal(false);
      prevSearchParams.current = searchParams.toString();
    }
  }, [searchParams]);

  // Handle "Show More" click
  const handleShowMore = useCallback(() => {
    console.log("Show More clicked");
    console.log("Current displayed events:", displayedEvents.length);

    // Set loading state
    setIsLoadingMore(true);

    // Calculate the next page
    const nextPage = Math.floor(displayedEvents.length / eventsPerPage) + 1;
    console.log("Fetching next page:", nextPage);

    // Fetch the next page of events
    const params = new URLSearchParams({
      ...(eventQuery && { event: eventQuery }),
      ...(locationQuery && { location: locationQuery }),
      ...(filters.dateRange && { dateRange: filters.dateRange }),
      ...(filters.customDate && { customDate: filters.customDate }),
      ...(filters.minDate && { minDate: filters.minDate }),
      ...(filters.maxDate && { maxDate: filters.maxDate }),
      ...(sortBy && { order: sortBy }),
      ...(filters.genre && filters.genre !== "all" && { genre: filters.genre }),
      limit: eventsPerPage.toString(),
      page: nextPage.toString(),
    });

    fetchEvents(params)
      .then((newData) => {
        console.log("New page data received:", newData.events.length);

        // Combine the new events with the existing ones
        const combinedEvents = [...displayedEvents, ...newData.events];
        setDisplayedEvents(combinedEvents);
        setAllEvents(combinedEvents);

        // Check if there are more events to load
        const hasMore = newData.pagination.hasMore;
        console.log("Setting hasMoreLocal to:", hasMore);
        setHasMoreLocal(hasMore);
      })
      .catch((error) => {
        console.error("Error fetching more events:", error);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [
    eventQuery,
    locationQuery,
    filters,
    displayedEvents,
    eventsPerPage,
    sortBy,
  ]);

  // Update the filter handlers
  const handlePendingFilterChange = (key: keyof Filters, value: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset customDate if dateRange is changed and it's not custom
      ...(key === "dateRange" && value !== "custom" ? { customDate: "" } : {}),
    }));
  };

  // Update date filter handler
  const handlePendingDateFilterChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDate(true);
      setPendingFilters((prev) => ({
        ...prev,
        dateRange: value,
        // Clear minDate and maxDate when switching to custom date
        minDate: "",
        maxDate: "",
      }));
    } else {
      setShowCustomDate(false);
      setPendingFilters((prev) => ({
        ...prev,
        dateRange: value,
        customDate: "", // Clear custom date when selecting a preset date range
        // Clear minDate and maxDate when switching to a preset date range
        minDate: "",
        maxDate: "",
      }));
    }
  };

  // Add custom date range handler
  const handleCustomDateChange = (
    type: "minDate" | "maxDate",
    value: string
  ) => {
    setPendingFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Add apply filters function
  const applyFilters = () => {
    setFilters(pendingFilters);
    setSortBy(pendingSortBy);
    setIsMobileFiltersOpen(false);
    setAllEvents([]);
    setDisplayedEvents([]);
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
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
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Add reset filters function at the component level
  const resetFilters = () => {
    setPendingFilters({
      platform: "all",
      dateRange: "all",
      priceRange: "all",
      customDate: "",
      minDate: "",
      maxDate: "",
      genre: "all",
    });
    setPendingSortBy("trending");
    setShowCustomDate(false);
  };

  // Add clearAllFilters function
  const clearAllFilters = () => {
    const defaultFilters: Filters = {
      platform: "all",
      dateRange: "all",
      priceRange: "all",
      customDate: "",
      minDate: "",
      maxDate: "",
      genre: "all",
    };

    setFilters(defaultFilters);
    setSortBy("trending");
    setPendingFilters(defaultFilters);
    setPendingSortBy("trending");
    setActiveFilters(defaultFilters);
    setShowCustomDate(false);

    // Clear URL params if any
    if (eventQuery || locationQuery) {
      router.push("/find-events");
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Reset body scroll when component unmounts
      document.body.style.overflow = "unset";
    };
  }, []);

  // Add this effect to handle body scroll for mobile filters
  useEffect(() => {
    document.body.style.overflow = isMobileFiltersOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileFiltersOpen]);

  // Function to remove a filter
  const removeFilter = (key: string) => {
    // Update both active filters and actual filters
    const updatedFilters = {
      ...filters,
      [key]: "all", // Reset to "all" or appropriate default
    };

    // Update the filters state
    setFilters(updatedFilters);

    // Also update active filters for UI
    setActiveFilters(updatedFilters);
  };

  // Update active filters when filters change
  useEffect(() => {
    setActiveFilters(filters);
  }, [filters]);

  // Function to handle sorting option change
  const handleSortByChange = (value: string) => {
    setPendingSortBy(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Active Filters Badges - Moved to a more prominent position */}
        <div className="mb-4">
          <ActiveFiltersBadges
            filters={{
              ...transformFiltersToObject(filters),
              ...(sortBy !== "trending" && { sortBy }),
            }}
            onRemoveFilter={(key) => {
              if (key === "sortBy") {
                setSortBy("trending");
                setAllEvents([]);
                setDisplayedEvents([]);
              } else {
                removeFilter(key);
              }
            }}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Mobile filter dialog */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-300 ${
            isMobileFiltersOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileFiltersOpen(false)}
        ></div>

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
                    onClick={() => toggleSection("date")}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Date
                    </h3>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        expandedSections.date ? "transform rotate-180" : ""
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
                            onChange={(e) =>
                              handlePendingDateFilterChange(e.target.value)
                            }
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}

                      {/* Custom Date Input */}
                      {showCustomDate && (
                        <div className="space-y-3 mt-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              From
                            </label>
                            <input
                              type="date"
                              value={pendingFilters.minDate}
                              onChange={(e) =>
                                handleCustomDateChange(
                                  "minDate",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              To
                            </label>
                            <input
                              type="date"
                              value={pendingFilters.maxDate}
                              onChange={(e) =>
                                handleCustomDateChange(
                                  "maxDate",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Genre Filter */}
                <div className="space-y-4">
                  <button
                    onClick={() => toggleSection("genre")}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Genre
                    </h3>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        expandedSections.genre ? "transform rotate-180" : ""
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
                          onChange={(e) =>
                            handlePendingFilterChange("genre", e.target.value)
                          }
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm">All Genres</span>
                      </label>
                      {Object.entries(GENRE_MAPPINGS).map(
                        ([code, { label }]) => (
                          <label
                            key={code}
                            className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                          >
                            <input
                              type="radio"
                              name="genreFilter-mobile"
                              value={code}
                              checked={pendingFilters.genre === code}
                              onChange={(e) =>
                                handlePendingFilterChange(
                                  "genre",
                                  e.target.value
                                )
                              }
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        )
                      )}
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

        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Events Section */}
          <div className="flex-1">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>

              {/* Fix the filter button to properly toggle filters */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm 
                text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 
                font-medium"
              >
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <span>Filters</span>
                {Object.values(filters).some(
                  (value) => value !== "all" && value !== ""
                ) && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </button>
              {!isFiltersVisible && (
                <button
                  onClick={() => setIsFiltersVisible(true)}
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm 
                  text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 
                  font-medium group"
                >
                  <FunnelIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  <span>Filters</span>
                  {Object.values(filters).some(
                    (value) => value !== "all" && value !== ""
                  ) && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  )}
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
                          platform: "all",
                          dateRange: "all",
                          priceRange: "all",
                          customDate: "",
                          minDate: "",
                          maxDate: "",
                          genre: "all",
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
                displayedEvents.map((event: ExtendedEvent) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>

            {/* Show More Button */}
            {hasMoreLocal && !isLoading && !isLoadingMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleShowMore}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Show More Events</span>
                </button>
              </div>
            )}

            {/* Loading More Events State */}
            {hasMoreLocal && !isLoading && isLoadingMore && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-blue-500 text-white rounded-lg font-medium shadow-md">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading More Events...</span>
                </div>
              </div>
            )}

            {/* Loading indicator for initial load */}
            {isLoading && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-600 rounded-lg font-medium animate-pulse">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading Events...</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Filter Panel - Moved to right side */}
          {isFiltersVisible && (
            <div className="hidden lg:block w-72 bg-white p-5 rounded-xl shadow-md h-fit sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setIsFiltersVisible(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Date Filter */}
                <div className="space-y-4">
                  <button
                    onClick={() => toggleSection("date")}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Date
                    </h3>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        expandedSections.date ? "transform rotate-180" : ""
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
                            onChange={(e) =>
                              handlePendingDateFilterChange(e.target.value)
                            }
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}

                      {/* Custom Date Input */}
                      {showCustomDate && (
                        <div className="space-y-3 mt-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              From
                            </label>
                            <input
                              type="date"
                              value={pendingFilters.minDate}
                              onChange={(e) =>
                                handleCustomDateChange(
                                  "minDate",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              To
                            </label>
                            <input
                              type="date"
                              value={pendingFilters.maxDate}
                              onChange={(e) =>
                                handleCustomDateChange(
                                  "maxDate",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border-gray-200 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Genre Filter */}
                <div className="space-y-4">
                  <button
                    onClick={() => toggleSection("genre")}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Genre
                    </h3>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        expandedSections.genre ? "transform rotate-180" : ""
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
                          onChange={(e) =>
                            handlePendingFilterChange("genre", e.target.value)
                          }
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-sm">All Genres</span>
                      </label>
                      {Object.entries(GENRE_MAPPINGS).map(
                        ([code, { label }]) => (
                          <label
                            key={code}
                            className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 py-2"
                          >
                            <input
                              type="radio"
                              name="genreFilter-desktop"
                              value={code}
                              checked={pendingFilters.genre === code}
                              onChange={(e) =>
                                handlePendingFilterChange(
                                  "genre",
                                  e.target.value
                                )
                              }
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindEventsPageContent;
