"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { UserIcon, CameraIcon, BookmarkIcon, ClockIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BookmarkedEvents from "@/components/profile/BookmarkedEvents";
import Image from "next/image";
import EventHistory from "@/components/profile/EventHistory";
import AccountSettings from "@/components/profile/AccountSettings";

interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("saved");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { update: updateSession } = useSession();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/update-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);

      // Update the session with the new image URL
      await updateSession({
        image: data.imageUrl,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Profile Header - Flat modern design */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-full h-full p-6 text-gray-400" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              disabled={isUploading}
            >
              <CameraIcon className="w-6 h-6 text-white" />
            </button>
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

      {/* Improved Tabs with mobile-friendly design */}
      <Tabs defaultValue={activeTab} className="space-y-6">
        <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-4 rounded-xl border border-gray-100 overflow-x-auto">
          <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-[400px] h-12 sm:h-14 items-center justify-start sm:justify-center rounded-lg bg-gray-50 p-1 gap-1">
            <TabsTrigger
              value="saved"
              onClick={() => setActiveTab("saved")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-6 py-2.5 sm:py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-gray-100 hover:bg-gray-50 data-[state=active]:hover:bg-white"
            >
              <BookmarkIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Saved Events</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              onClick={() => setActiveTab("history")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-6 py-2.5 sm:py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-gray-100 hover:bg-gray-50 data-[state=active]:hover:bg-white"
            >
              <ClockIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Event History</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() => setActiveTab("settings")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-6 py-2.5 sm:py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-gray-100 hover:bg-gray-50 data-[state=active]:hover:bg-white"
            >
              <Cog6ToothIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="saved" className="mt-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100">
            <BookmarkedEvents />
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100">
            <EventHistory />
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100">
            <AccountSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
