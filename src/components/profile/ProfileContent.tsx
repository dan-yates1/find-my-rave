"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, TicketIcon, UserIcon, CogIcon } from "@heroicons/react/24/outline";
import EventCard from "@/components/EventCard";

interface ProfileContentProps {
  user: any;
}

const ProfileContent = ({ user }: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const upcomingEvents: any[] = [];
  const pastEvents: any[] = [];
  const savedEvents: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32">
              <Image
                src={user.image || "/default-avatar.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-blue-600 font-medium">
                    {upcomingEvents.length} Upcoming Events
                  </span>
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-full">
                  <span className="text-purple-600 font-medium">
                    {savedEvents.length} Saved Events
                  </span>
                </div>
              </div>
            </div>
            <button className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
              <CogIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="bg-gray-100 rounded-xl p-2 w-full flex justify-start gap-2">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5" />
                Past Events
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Saved Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No Upcoming Events
                  </h3>
                  <p className="text-gray-500 mt-2">
                    You haven&apos;t registered for any upcoming events yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastEvents.length > 0 ? (
                pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-12">
                  <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No Past Events
                  </h3>
                  <p className="text-gray-500 mt-2">
                    You haven&apos;t attended any events yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              {savedEvents.length > 0 ? (
                savedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No Saved Events
                  </h3>
                  <p className="text-gray-500 mt-2">
                    You haven&apos;t saved any events yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;