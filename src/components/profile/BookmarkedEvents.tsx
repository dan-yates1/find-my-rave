"use client";

import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function BookmarkedEvents() {
  // First fetch the bookmarked event IDs
  const { data: bookmarkData, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['bookmarkedEvents'],
    queryFn: async () => {
      const response = await fetch('/api/bookmarks');
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      return response.json();
    },
  });

  // Then fetch the event details for each bookmarked event
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['bookmarkedEventsDetails', bookmarkData?.bookmarks],
    queryFn: async () => {
      if (!bookmarkData?.bookmarks?.length) return { events: [] };
      
      const events = await Promise.all(
        bookmarkData.bookmarks.map(async (bookmark: any) => {
          const response = await fetch(`/api/skiddle/events/${bookmark.eventId}`);
          if (!response.ok) throw new Error('Failed to fetch event details');
          const data = await response.json();
          
          // Transform Skiddle data to match our EventCard props
          return {
            id: data.results.id,
            title: data.results.eventname,
            startDate: data.results.startdate,
            location: `${data.results.venue.name}, ${data.results.venue.town}`,
            imageUrl: data.results.largeimageurl,
            platform: 'skiddle',
            // Add any other fields your EventCard needs
          };
        })
      );
      return { events };
    },
    enabled: !!bookmarkData?.bookmarks?.length,
  });

  const isLoading = isLoadingBookmarks || isLoadingEvents;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonEventCard key={i} />
        ))}
      </div>
    );
  }

  if (!bookmarkData?.bookmarks?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-50 rounded-full p-3">
            <BookmarkIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">No Bookmarked Events</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven&apos;t bookmarked any events yet. Browse events and bookmark the ones you&apos;re interested in!
            </p>
          </div>
          <Link
            href="/find-events"
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-8 gap-6">
      {eventsData?.events.map((event: any) => (
        <EventCard
          key={event.id}
          event={event}
          initialIsBookmarked={true}
        />
      ))}
    </div>
  );
} 