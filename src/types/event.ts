/**
 * Event type definitions
 * 
 * This file contains type definitions for events from various platforms.
 * It provides a common interface for working with events across the application.
 */

/**
 * Base Event interface that matches the Prisma Event model
 * and includes additional fields needed for scraped events
 */
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  town?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  link?: string;
  price?: number | null;
  entryPrice?: string | null;
  minAge?: number | null;
  platform: string;
  approved?: boolean;
  genres?: Array<{ genreid: string; name: string }>;
  artists?: any[];
  lineup?: string[];
  venue?: {
    name: string;
    town: string;
    postcode?: string;
    country?: string;
    phone?: string;
    website?: string;
  };
  openingtimes?: any;
}

/**
 * Extended event interface for additional platform-specific properties
 */
export interface ExtendedEvent extends Event {
  // Add any additional properties needed for specific platforms
}

/**
 * Event response from the API
 */
export interface EventsResponse {
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}
