import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word characters with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function getLatLon(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`
    );

    if (!response.ok) {
      console.error("Failed to fetch location data", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lon, lat] = data.features[0].center;
      return { lat, lon };
    } else {
      console.error("No location data found for the given location");
      return null;
    }
  } catch (error) {
    console.error("Error fetching location data", error);
    return null;
  }
}

export const getDateRangeFilter = (dateRange: string, customDate?: string) => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  
  switch (dateRange) {
    case 'today':
      return {
        startDate: startOfDay,
        endDate: new Date(now.setHours(23, 59, 59, 999))
      };
    case 'tomorrow':
      const tomorrow = new Date(startOfDay);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        startDate: tomorrow,
        endDate: new Date(tomorrow.setHours(23, 59, 59, 999))
      };
    case 'this-week':
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      return {
        startDate: startOfDay,
        endDate: new Date(endOfWeek.setHours(23, 59, 59, 999))
      };
    case 'weekend':
      const startOfWeekend = new Date(startOfDay);
      startOfWeekend.setDate(startOfWeekend.getDate() + (6 - startOfWeekend.getDay()));
      const endOfWeekend = new Date(startOfWeekend);
      endOfWeekend.setDate(endOfWeekend.getDate() + 1);
      return {
        startDate: startOfWeekend,
        endDate: new Date(endOfWeekend.setHours(23, 59, 59, 999))
      };
    case 'custom':
      if (customDate) {
        const selectedDate = new Date(customDate);
        return {
          startDate: selectedDate,
          endDate: new Date(selectedDate.setHours(23, 59, 59, 999))
        };
      }
      return null;
    default:
      return null;
  }
};
