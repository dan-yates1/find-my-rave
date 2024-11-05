"use client";

import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface LocationSearchInputProps {
  location: string;
  onLocationChange: (location: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  location,
  onLocationChange,
  onKeyDown,
}) => {
  return (
    <div className="flex items-center flex-1 min-w-0">
      <MapPinIcon className="h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Location..."
        className="w-full bg-transparent border-none outline-none px-3 py-2 text-gray-900 placeholder-gray-500"
      />
    </div>
  );
};

export default LocationSearchInput;
