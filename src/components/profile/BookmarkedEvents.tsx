"use client";

import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";

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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load bookmarked events</p>
      </div>
    );
  }

  if (!data?.bookmarks?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookmarked events yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
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