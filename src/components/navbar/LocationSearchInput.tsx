"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface LocationSuggestion {
  name: string;
  country: string;
}

interface LocationSearchInputProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  location,
  onLocationChange,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.length > 0) {
      fetchLocationSuggestions(location).then((results) => {
        setSuggestions(results);
        setShowSuggestions(true);
      });
    } else {
      setShowSuggestions(false);
    }
  }, [location]);

  const fetchLocationSuggestions = async (
    query: string
  ): Promise<LocationSuggestion[]> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch location suggestions",
          response.statusText
        );
        return [];
      }

      const data = await response.json();

      return data.features.map((place: any) => ({
        name: place.place_name,
        country:
          place.context?.find((ctx: any) => ctx.id.includes("country"))?.text ||
          "",
      }));
    } catch (error) {
      console.error("Error fetching location suggestions", error);
      return [];
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onLocationChange(suggestion.name);
    setShowSuggestions(false);
    inputRef.current?.blur(); // Explicitly blur the input after selection
  };

  const handleFocus = () => {
    if (location.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Add a small timeout to allow the click to register before closing suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  return (
    <div className="relative flex-grow">
      <div className="flex items-center space-x-2">
        <MapPinIcon className="w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Location"
          className="bg-transparent outline-none flex-grow"
        />
      </div>

      {showSuggestions && (
        <ul className="absolute left-0 right-0 bg-white rounded-lg shadow-lg mt-2 z-20">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-200 last:border-none"
            >
              <div className="font-semibold">{suggestion.name}</div>
              <div className="text-sm text-gray-500">{suggestion.country}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchInput;
