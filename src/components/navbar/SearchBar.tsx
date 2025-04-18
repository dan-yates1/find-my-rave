"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MapPinIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onSearch: (params: { input: string; location: string }) => void;
  initialInput?: string;
  initialLocation?: string;
  className?: string;
  compact?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isLocationVisible?: boolean;
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
  className = "",
  compact = false,
  onFocus,
  onBlur,
  isLocationVisible = false,
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
  const searchContainerRef = useRef<HTMLFormElement>(null);

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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowRecentSearches(false);
        setIsFocused(false);
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Handle input focus
  const handleInputFocus = () => {
    setShowRecentSearches(true);
    setIsFocused(true);
    onFocus?.();
  };

  // Handle location focus
  const handleLocationFocus = () => {
    setShowRecentSearches(false);
    setIsFocused(true);
    onFocus?.();
  };

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName.split(',')[0]);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleLocationInput = (value: string) => {
    setLocation(value);
    if (value.length > 1) {
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`w-full ${className} relative`}
      ref={searchContainerRef}
    >
      <div className={compact ? "flex flex-col gap-2" : "flex rounded-full border"}>
        {/* Search Input */}
        <div className={`flex items-center ${
          compact 
            ? 'bg-gray-100 rounded-full p-2 w-full' 
            : 'flex-1 pl-4 pr-2 py-2'
        }`}>
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="an artist, genre, or keyword"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            enterKeyHint="search"
            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 px-2"
          />
        </div>

        {/* Location Input */}
        <div 
          className={`
            ${compact ? 'overflow-hidden transition-all duration-300 ease-in-out w-full' : 'flex-1 relative'}
            ${(!compact || (compact && isLocationVisible)) 
              ? 'max-h-[48px] opacity-100' 
              : 'max-h-0 opacity-0'
            }
          `}
        >
          {!compact && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-gray-300" />}
          <div className={`flex items-center h-full ${
            compact 
              ? 'bg-gray-100 rounded-full p-2 w-full' 
              : 'pl-4 pr-2 py-2'
          }`}>
            <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 flex items-center">
              <input
                type="search"
                placeholder="Anywhere"
                value={location}
                onChange={(e) => handleLocationInput(e.target.value)}
                onFocus={handleLocationFocus}
                onKeyDown={handleKeyDown}
                enterKeyHint="search"
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 px-2"
              />
            </div>
            {!compact && (
              <button
                type="submit"
                className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add a hidden submit button for mobile form submission */}
      <button type="submit" className="hidden" />

      {/* Location Suggestions - Aligned with location input */}
      {showSuggestions && locationSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 ${
            compact ? 'left-0 right-0' : 'w-[50%]'
          }`}
          style={{ 
            left: compact ? 0 : '50%',
            top: '100%'
          }}
        >
          {locationSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              onClick={() => handleLocationSelect(suggestion.name)}
            >
              <div className="text-sm text-gray-900">{suggestion.mainPlace}</div>
              {suggestion.subtext && (
                <div className="text-xs text-gray-500">{suggestion.subtext}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches - Aligned with search input */}
      {showRecentSearches && recentSearches.length > 0 && (
        <div
          ref={recentSearchesRef}
          className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 ${
            compact ? 'left-0 right-0' : 'w-[50%]'
          }`}
          style={{ 
            left: 0,
            top: '100%'
          }}
        >
          <div className="p-2 border-b">
            <h3 className="text-sm font-medium text-gray-500">Recent Searches</h3>
          </div>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              onClick={() => {
                setInput(search.input);
                setLocation(search.location);
                setShowRecentSearches(false);
                handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
              }}
            >
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm text-gray-900">{search.input}</div>
                  {search.location && (
                    <div className="text-xs text-gray-500">{search.location}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
