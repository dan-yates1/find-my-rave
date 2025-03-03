import React from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { GENRE_MAPPINGS } from "@/lib/constants";

interface ActiveFiltersBadgesProps {
  filters: { [key: string]: string }; // Object containing active filters
  onRemoveFilter: (key: string) => void; // Function to remove a filter
  onClearAll?: () => void; // Function to clear all filters
}

// Helper function to format filter names and values for display
const formatFilterLabel = (key: string, value: string): string => {
  // Format the key for display
  const keyMap: Record<string, string> = {
    dateRange: "Date",
    genre: "Genre",
    priceRange: "Price",
    platform: "Platform",
    customDate: "Date",
    sortBy: "Sort By",
  };

  // Format the value for display
  let displayValue = value;
  
  // Special handling for genre
  if (key === 'genre') {
    // Check if the value is a valid key in GENRE_MAPPINGS
    const genreKey = value as keyof typeof GENRE_MAPPINGS;
    if (GENRE_MAPPINGS[genreKey]) {
      displayValue = GENRE_MAPPINGS[genreKey].label;
    }
  }
  
  // Format date ranges
  if (key === 'dateRange') {
    const dateMap: Record<string, string> = {
      'today': 'Today',
      'tomorrow': 'Tomorrow',
      'this-week': 'This Week',
      'weekend': 'This Weekend',
      'custom': 'Custom Date'
    };
    displayValue = dateMap[value] || value;
  }

  // Format sort by options
  if (key === 'sortBy') {
    const sortByMap: Record<string, string> = {
      'trending': 'Trending',
      'date': 'Date',
      'bestselling': 'Best Selling',
      'goingto': 'Most Popular',
    };
    displayValue = sortByMap[value] || value;
  }

  return `${keyMap[key] || key}: ${displayValue}`;
};

const ActiveFiltersBadges: React.FC<ActiveFiltersBadgesProps> = ({ 
  filters, 
  onRemoveFilter,
  onClearAll 
}) => {
  // If no active filters, don't render anything
  if (Object.keys(filters).length === 0) {
    return null;
  }

  const filterCount = Object.keys(filters).length;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 py-2 bg-gray-50 rounded-lg">
      <div className="flex items-center mr-2">
        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
      </div>
      {Object.entries(filters).map(([key, value]) => (
        value && value !== "all" && (
          <div 
            key={key} 
            className="flex items-center bg-white border border-gray-200 text-gray-800 px-3 py-1 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm">{formatFilterLabel(key, value)}</span>
            <button 
              onClick={() => onRemoveFilter(key)} 
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={`Remove ${key} filter`}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )
      ))}
      
      {filterCount > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFiltersBadges;