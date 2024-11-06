"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, TicketIcon, UserIcon, CogIcon, CameraIcon } from "@heroicons/react/24/outline";
import EventCard from "@/components/EventCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileContentProps {
  user: any;
}

const ProfileContent = ({ user }: ProfileContentProps) => {
  const { update: updateSession, data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentImage, setCurrentImage] = useState(user.image);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await fetch('/api/user/events');
        if (response.ok) {
          const data = await response.json();
          setUpcomingEvents(data.upcoming);
          setSavedEvents(data.saved);
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    };

    fetchUserEvents();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/user/update-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { imageUrl } = await response.json();
      
      // Update local state
      setCurrentImage(imageUrl);
      
      // Update the session with the new image
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: imageUrl,
        }
      });

      // Force a refresh of the page data
      router.refresh();

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image Section */}
            <div 
              className="relative w-32 h-32 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-full overflow-hidden">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-6xl font-semibold">
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <CameraIcon className="w-8 h-8 text-white" />
              </div>
              
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              
              {/* Loading Overlay */}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Rest of the component remains the same */}
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
          </div>
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="bg-white rounded-xl p-2 shadow-sm">
            <TabsTrigger
              value="upcoming"
              className="flex items-center gap-2 px-4 py-2"
              onClick={() => setActiveTab("upcoming")}
            >
              <CalendarIcon className="w-5 h-5" />
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex items-center gap-2 px-4 py-2"
              onClick={() => setActiveTab("past")}
            >
              <TicketIcon className="w-5 h-5" />
              Past Events
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex items-center gap-2 px-4 py-2"
              onClick={() => setActiveTab("saved")}
            >
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
              <div className="text-center py-12 bg-white rounded-2xl">
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
            {/* Past Events Content */}
            <div className="text-center py-12 bg-white rounded-2xl">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No Past Events
              </h3>
              <p className="text-gray-500 mt-2">
                You haven&apos;t attended any events yet.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedEvents.length > 0 ? (
              savedEvents.map((event) => (
                <EventCard key={event.id} event={event} saved={true} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
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
  );
};

export default ProfileContent;