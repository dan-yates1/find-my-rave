"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MapPinIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onSearch: (params: { input: string; location: string }) => void;
  initialInput?: string;
  initialLocation?: string;
}

const MAX_RECENT_SEARCHES = 5;

interface RecentSearch {
  input: string;
  location: string;
  timestamp: number;
}

export default function SearchBar({
  onSearch,
  initialInput = "",
  initialLocation = "",
}: SearchBarProps) {
  const [input, setInput] = useState(initialInput);
  const [location, setLocation] = useState(initialLocation);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedLocation = useDebounce(location, 300);
  const recentSearchesRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (input: string, location: string) => {
    const newSearch: RecentSearch = {
      input,
      location,
      timestamp: Date.now(),
    };

    setRecentSearches(prevSearches => {
      const filteredSearches = prevSearches.filter(
        search => !(search.input === input && search.location === location)
      );
      const updatedSearches = [newSearch, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  };

  // Clear specific recent search
  const clearRecentSearch = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prevSearches => {
      const updatedSearches = prevSearches.filter((_, i) => i !== index);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentSearch: RecentSearch) => {
    setInput(recentSearch.input);
    setLocation(recentSearch.location);
    onSearch({
      input: recentSearch.input,
      location: recentSearch.location,
    });
    setShowRecentSearches(false);
  };

  // Existing handleSubmit modification
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || location.trim()) {
      saveRecentSearch(input, location);
      onSearch({ input, location: location.split(',')[0] });
    }
    setShowSuggestions(false);
    setShowRecentSearches(false);
    setIsFocused(false);
    setLocationSuggestions([]);
  };

  const handleCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&types=place&limit=1`
          );
          const data = await response.json();
          if (data.features?.[0]) {
            const locationName = data.features[0].text;
            setLocation(locationName);
            setLocationSuggestions([]);
            setShowSuggestions(false);
            setIsFocused(false);
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
        }
      });
    }
  };

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (debouncedLocation.trim() && isFocused) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              debouncedLocation
            )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&types=place&limit=5`
          );
          const data = await response.json();
          const suggestions = data.features.map((feature: any) => ({
            name: feature.place_name,
            mainPlace: feature.text,
            subtext: feature.context
              ?.map((ctx: any) => ctx.text)
              .filter(Boolean)
              .join(', ')
          }));
          setLocationSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
        }
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchLocationSuggestions();
  }, [debouncedLocation, isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
        setLocationSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        recentSearchesRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !recentSearchesRef.current.contains(event.target as Node)
      ) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName.split(',')[0]);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-8">
      <div className="relative flex h-12 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center pl-6">
          <MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-400" />
        </div>

        <div className="flex-1 flex items-center pl-3 relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search events..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowRecentSearches(true)}
            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
          />
          
          {/* Recent Searches Dropdown */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div
              ref={recentSearchesRef}
              className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div className="p-2 border-b border-gray-200">
                <p className="text-sm text-gray-500">Recent Searches</p>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 hover:rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{search.input || search.location}</p>
                      {search.input && search.location && (
                        <p className="text-xs text-gray-500">{search.location}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => clearRecentSearch(index, e)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-full flex items-center px-4">
          <div className="h-6 w-[1px] bg-gray-300"></div>
        </div>

        <div className="flex-1 relative flex items-center pl-2">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (!location) {
                setShowSuggestions(true);
              }
            }}
            className="w-full bg-transparent border-none outline-none pl-2 pr-4 text-gray-900 placeholder-gray-500"
          />
          {((showSuggestions && locationSuggestions.length > 0) || (isFocused && !location)) && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              {!location && (
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Use current location</span>
                </button>
              )}
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  onClick={() => handleLocationSelect(suggestion.name)}
                >
                  <div className="text-sm text-gray-900">{suggestion.mainPlace}</div>
                  <div className="text-xs text-gray-500">{suggestion.subtext}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pr-2 pl-1 flex items-center">
          <button
            type="submit"
            className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </form>
  );
}
