"use client";

import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import LocationSearchInput from "./LocationSearchInput";

interface SearchBarProps {
  onSearch: (params: { input: string; location: string }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [input, setInput] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ input, location });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="flex items-center bg-gray-100 rounded-full h-12">
        <div className="flex items-center flex-1 px-4 space-x-4">
          {/* Event Search Input */}
          <div className="flex items-center flex-1 min-w-0">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-3 text-gray-600 placeholder-gray-500 text-sm min-w-0"
            />
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 flex-shrink-0"></div>

          {/* Location Search Input */}
          <div className="flex-1 min-w-0">
            <LocationSearchInput
              location={location}
              onLocationChange={setLocation}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 flex-shrink-0"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
