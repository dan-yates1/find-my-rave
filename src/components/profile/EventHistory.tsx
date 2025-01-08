"use client";

import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import SkeletonEventCard from "@/components/SkeletonEventCard";
import { CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

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

  if (!data?.events?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-50 rounded-full p-3">
            <CalendarIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">No Event History</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven&apos;t attended any events yet. Start exploring events near you!
            </p>
          </div>
          <Link
            href="/find-events"
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Find Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
} 