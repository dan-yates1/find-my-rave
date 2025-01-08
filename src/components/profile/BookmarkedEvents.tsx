"use client";

import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function BookmarkedEvents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookmarkedEvents'],
    queryFn: async () => {
      const response = await fetch('/api/user/bookmarks');
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonEventCard key={i} />
        ))}
      </div>
    );
  }

  if (!data?.bookmarks?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-50 rounded-full p-3">
            <BookmarkIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">No Saved Events</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven&apos;t saved any events yet. Browse events and bookmark the ones you&apos;re interested in!
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.bookmarks.map((bookmark: any) => (
        <EventCard 
          key={bookmark.eventId} 
          event={{
            id: bookmark.eventId,
            title: bookmark.event.eventname,
            startDate: new Date(bookmark.event.startdate),
            endDate: new Date(bookmark.event.enddate),
            location: bookmark.event.venue.name,
            imageUrl: bookmark.event.largeimageurl,
            platform: 'skiddle',
            description: bookmark.event.description,
            latitude: parseFloat(bookmark.event.venue.latitude),
            longitude: parseFloat(bookmark.event.venue.longitude),
            link: bookmark.event.link,
            price: parseFloat(bookmark.event.entryprice) || 0,
            eventType: bookmark.event.EventCode,
            slug: bookmark.event.id,
            approved: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }} 
          initialIsBookmarked={true}
        />
      ))}
    </div>
  );
} 