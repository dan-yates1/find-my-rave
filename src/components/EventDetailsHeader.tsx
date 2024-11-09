"use client";

import { Event } from "@prisma/client";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, ClockIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import SaveEventButton from "./SaveEventButton";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface EventDetailsHeaderProps {
  event: Event;
}

const EventDetailsHeader = ({ event }: EventDetailsHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === 'admin';

  const formattedDate = new Date(event.startDate).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).replace(',', '');

  const formattedTime = new Date(event.startDate).toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/events?id=${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/find-events');
        router.refresh();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleEdit = () => {
    router.push(`/events/${event.slug}/edit`);
  };

  return (
    <div className="relative">
      {/* Hero Image Container */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* Background blurred image */}
        <div className="absolute inset-0 scale-125" style={{ filter: 'blur(0px)' }}>
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt=""
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>
        
        {/* Sharp foreground image */}
        <div className="absolute inset-0 opacity-90">
          <Image
            src={event.imageUrl || "/event-placeholder2.jpg"}
            alt={event.title}
            fill
            className="object-cover blur-md"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Event Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveEventButton 
              eventId={event.id} 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-3 transition-all duration-200"
              iconClassName="w-7 h-7"
            />
            
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-3 transition-all duration-200"
                >
                  <EllipsisHorizontalIcon className="w-7 h-7" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Edit Event
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Delete Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsHeader; 