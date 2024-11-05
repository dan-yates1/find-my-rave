"use client";

import { useState } from "react";
import { Event } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPendingEvents = async () => {
    const response = await fetch("/api/admin/events");
    if (response.ok) {
      const data = await response.json();
      setPendingEvents(data.events);
    }
    setLoading(false);
  };

  const handleApprove = async (eventId: string) => {
    const response = await fetch(`/api/admin/events/${eventId}/approve`, {
      method: "POST",
    });

    if (response.ok) {
      setPendingEvents((events) => events.filter((e) => e.id !== eventId));
      router.refresh();
    }
  };

  const handleDelete = async (eventId: string) => {
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setPendingEvents((events) => events.filter((e) => e.id !== eventId));
      router.refresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Events</h2>
          <div className="space-y-4">
            {pendingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={event.imageUrl || "/rave-bg.jpg"}
                    alt={event.title}
                    width={100}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.location}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(event.id)}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            {pendingEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No pending events to review
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 