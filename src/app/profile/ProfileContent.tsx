"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { UserIcon, CameraIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EventCard from "@/components/EventCard";
import { useQuery } from '@tanstack/react-query';

interface ProfileContentProps {
  user: User;
}

const ProfileContent = ({ user }: ProfileContentProps) => {
  const { update: updateSession } = useSession();
  const [uploading, setUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("saved");

  // Fetch saved events using React Query
  const { data: savedEventsData, isLoading: isSavedEventsLoading } = useQuery({
    queryKey: ['savedEvents'],
    queryFn: async () => {
      const response = await fetch('/api/user/saved-events');
      if (!response.ok) {
        throw new Error('Failed to fetch saved events');
      }
      const data = await response.json();
      return data.savedEvents;
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      
      // Update user profile image
      const updateResponse = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: data.url,
        }),
      });

      if (!updateResponse.ok) throw new Error("Failed to update profile");

      // Update session
      updateSession({
        image: data.url,
      });

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex items-center gap-8">
            <div 
              className="relative cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {user.image ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <img
                    src={user.image}
                    alt={user.name || "Profile"}
                    className={`w-full h-full object-cover transition-all duration-200 ${
                      isHovered ? 'brightness-75' : 'brightness-100'
                    }`}
                  />
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center transition-all duration-200 ${
                  isHovered ? 'bg-gray-300' : 'bg-gray-200'
                }`}>
                  <UserIcon className="w-16 h-16 text-gray-400" />
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name || "User"}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} className="space-y-8">
          <TabsList className="bg-white rounded-xl p-1 shadow-sm">
            <TabsTrigger
              value="saved"
              onClick={() => setActiveTab("saved")}
              className="flex-1"
            >
              Saved Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-6">
            {isSavedEventsLoading ? (
              <div className="text-center py-12">Loading saved events...</div>
            ) : savedEventsData?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedEventsData.map((event: any) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))}
              </div>
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
