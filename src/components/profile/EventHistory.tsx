"use client";

import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";

export default function EventHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['eventHistory'],
    queryFn: async () => {
      const response = await fetch('/api/user/events');
      if (!response.ok) throw new Error('Failed to fetch event history');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonEventCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.events?.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
} 