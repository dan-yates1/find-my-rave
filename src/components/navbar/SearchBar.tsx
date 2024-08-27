"use client";

import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import LocationSearchInput from "./LocationSearchInput";

interface SearchBarProps {
  onSearch: (searchParams: { input: string; location: string }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [input, setInput] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSearch = () => {
    onSearch({ input, location });
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-full bg-gray-100 px-4 py-2 w-full">
      {/* Search input */}
      <div className="flex items-center space-x-2 flex-grow">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Search for..."
          className="bg-transparent outline-none flex-grow"
        />
      </div>

      {/* Divider */}
      <div className="border-l border-gray-300 h-6 mx-2"></div>

      {/* Location input */}
      <LocationSearchInput location={location} onLocationChange={setLocation} />

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="ml-3 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;
