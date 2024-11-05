"use client";

import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import LocationSearchInput from "./LocationSearchInput";

interface SearchBarProps {
  onSearch: (params: { input: string; location: string }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [input, setInput] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    onSearch({ input, location });
  };

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto py-2">
      <div className="flex items-center w-full bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
        {/* Event Search */}
        <div className="flex items-center flex-1 min-w-0 pl-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search events..."
            className="w-full bg-transparent border-none outline-none px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

        {/* Location Search */}
        <div className="flex items-center flex-1 min-w-0">
          <LocationSearchInput 
            location={location} 
            onLocationChange={setLocation} 
            onKeyDown={handleKeyDown}
          />
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors mr-1"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
