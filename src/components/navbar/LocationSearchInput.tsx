"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPinIcon, MapIcon } from "@heroicons/react/24/outline";

interface LocationSearchInputProps {
  location: string;
  onLocationChange: (location: string, shouldSearch?: boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface Suggestion {
  place_name: string;
  id: string;
  text?: string;
  context: Array<{
    text: string;
  }>;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  location,
  onLocationChange,
  onKeyDown,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onLocationChange(value, true);

    if (value.length > 1) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&types=place&limit=4`
        );
        
        if (!response.ok) {
          throw new Error('Mapbox API request failed');
        }
        
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const mainPlace = suggestion.text || suggestion.place_name.split(',')[0];
    onLocationChange(mainPlace);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatSuggestion = (suggestion: Suggestion) => {
    const mainPlace = suggestion.text || suggestion.place_name.split(',')[0];
    const region = suggestion.context?.[0]?.text || '';
    const country = suggestion.context?.[suggestion.context.length - 1]?.text || '';
    return {
      mainPlace,
      subtext: [region, country].filter(Boolean).join(', ')
    };
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&types=place&limit=1`
            );
            const data = await response.json();
            if (data.features?.[0]) {
              const mainPlace = data.features[0].text || data.features[0].place_name.split(',')[0];
              onLocationChange(mainPlace);
              setSuggestions([]);
              setShowSuggestions(false);
            }
          } catch (error) {
            console.error("Error fetching location name:", error);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <div className="flex items-center">
        <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={location}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Choose a location"
          className="flex-1 bg-transparent border-none outline-none px-3 text-gray-600 placeholder-gray-500 text-sm min-w-0"
        />
      </div>
      
      {((showSuggestions && suggestions.length > 0) || (isFocused && !location)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {!location && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleCurrentLocation();
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <MapIcon className="h-4 w-4 text-blue-600" />
              <div className="text-sm p-1 text-gray-900">Use my current location</div>
            </button>
          )}
          {suggestions.map((suggestion) => {
            const { mainPlace, subtext } = formatSuggestion(suggestion);
            return (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <div className="text-sm text-gray-900">{mainPlace}</div>
                <div className="text-xs text-gray-500">{subtext}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
