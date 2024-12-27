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
    <div className="mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 border-b border-gray-200">
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

      {/* Improved Tabs */}
      <Tabs defaultValue={activeTab} className="space-y-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-lg bg-gray-100/80 p-1.5 gap-1">
            <TabsTrigger
              value="saved"
              onClick={() => setActiveTab("saved")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-gray-50 data-[state=active]:hover:bg-white"
            >
              <BookmarkIcon className="w-4 h-4 mr-2" />
              Saved Events
            </TabsTrigger>
            <TabsTrigger
              value="history"
              onClick={() => setActiveTab("history")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-gray-50 data-[state=active]:hover:bg-white"
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Event History
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() => setActiveTab("settings")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-gray-50 data-[state=active]:hover:bg-white"
            >
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="saved" className="mt-6">
          <BookmarkedEvents />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <EventHistory />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
