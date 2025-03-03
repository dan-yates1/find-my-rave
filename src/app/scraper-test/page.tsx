"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const GENRE_OPTIONS = [
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

const PLATFORM_OPTIONS = [
  { label: "All platforms", value: "all" },
  { label: "Dice", value: "dice" },
  { label: "Resident Advisor", value: "resident-advisor" },
];

export default function ScraperTestPage() {
  const [formState, setFormState] = useState({
    platform: "all",
    location: "london",
    keyword: "",
    limit: "5",
    genre: "all",
    chromePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Default Chrome path for Windows
  });

  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["test-scraper", formState],
    queryFn: async () => {
      const params = new URLSearchParams({
        platform: formState.platform,
        ...(formState.location && { location: formState.location }),
        ...(formState.keyword && { keyword: formState.keyword }),
        ...(formState.limit && { limit: formState.limit }),
        ...(formState.genre !== "all" && { genre: formState.genre }),
        ...(formState.chromePath && { chromePath: formState.chromePath }),
      });

      const response = await fetch(`/api/test-scraper?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to test scrapers");
      }
      return response.json();
    },
    enabled: false, // Don't run query on mount
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Web Scraper Test Tool</h1>
      <p className="mb-6 text-gray-600">
        Use this tool to test the web scrapers and verify they are correctly extracting event data
        from the target websites.
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Parameters</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                name="platform"
                value={formState.platform}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formState.location}
                onChange={handleInputChange}
                placeholder="e.g., london, manchester, berlin"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keyword
              </label>
              <input
                type="text"
                name="keyword"
                value={formState.keyword}
                onChange={handleInputChange}
                placeholder="e.g., techno, party, festival"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <input
                type="number"
                name="limit"
                value={formState.limit}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                name="genre"
                value={formState.genre}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GENRE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chrome Path
              </label>
              <input
                type="text"
                name="chromePath"
                value={formState.chromePath}
                onChange={handleInputChange}
                placeholder="e.g., C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? "Testing..." : "Test Scrapers"}
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-pulse flex space-x-4 items-center">
            <div className="rounded-full bg-blue-400 h-12 w-12 flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-lg font-medium text-gray-700">Testing scrapers...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : "An error occurred while testing the scrapers."}
              </p>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-lg shadow-md p-6 my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <div className="text-sm text-gray-500">Execution time: {data.executionTime}</div>
          </div>

          {data.results.map((result: any, index: number) => (
            <div key={index} className="mb-8 last:mb-0">
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg">
                <h3 className="text-lg font-medium capitalize">{result.platform} Scraper</h3>
                <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {result.count} events found
                </div>
              </div>

              {result.error ? (
                <div className="bg-red-50 p-4 border border-red-100 rounded-b-lg">
                  <p className="text-red-700">Error: {result.error}</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-b-lg divide-y divide-gray-200">
                  {result.events.length === 0 ? (
                    <div className="p-4 text-gray-500">No events found</div>
                  ) : (
                    result.events.map((event: any) => (
                      <div key={event.id} className="p-4">
                        <div 
                          className="flex justify-between items-center cursor-pointer" 
                          onClick={() => toggleEventExpansion(event.id)}
                        >
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(event.startDate).toLocaleDateString()} at {event.location || event.venue?.name || "Unknown venue"}
                            </p>
                          </div>
                          <div>
                            {expandedEvents[event.id] ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {expandedEvents[event.id] && (
                          <div className="mt-4 bg-gray-50 p-4 rounded-lg text-sm">
                            <pre className="whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(event, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
