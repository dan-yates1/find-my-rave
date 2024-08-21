"use client";

import React, { useState, useEffect } from "react";
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
  const [hasFocus, setHasFocus] = useState(false);

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
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_GEO_DB_API_KEY || "",
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch location suggestions",
          response.statusText
        );
        return []; // Return an empty array if the request fails
      }

      const data = await response.json();

      if (!data.data) {
        console.error("Unexpected API response structure", data);
        return []; // Return an empty array if the data structure is unexpected
      }

      return data.data.map((city: any) => ({
        name: city.city,
        country: city.country,
      }));
    } catch (error) {
      console.error("Error fetching location suggestions", error);
      return []; // Return an empty array if an error occurs
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onLocationChange(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-grow">
      <div className="flex items-center space-x-2">
        <MapPinIcon className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          placeholder="Location"
          className="bg-transparent outline-none flex-grow"
        />
      </div>

      {showSuggestions && hasFocus && (
        <ul className="absolute left-0 right-0 bg-white rounded-lg shadow-lg mt-2 z-20">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
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
