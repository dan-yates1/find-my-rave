"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onSearch: (params: { input: string; location: string }) => void;
  initialInput?: string;
  initialLocation?: string;
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
  const [isFocused, setIsFocused] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedLocation = useDebounce(location, 300);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ input, location: location.split(',')[0] });
    setShowSuggestions(false);
    setIsFocused(false);
    setLocationSuggestions([]);
  };

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName.split(',')[0]);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-8">
      <div className="flex h-12 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center pl-6">
          <MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-400" />
        </div>

        <div className="flex-1 flex items-center pl-3">
          <input
            type="text"
            placeholder="Search events..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
          />
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
