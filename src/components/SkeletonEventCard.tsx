import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonEventCard: React.FC = () => {
  return (
    <div className="flex space-x-4 p-4 rounded-xl mb-6 bg-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <Skeleton className="w-52 h-28 rounded-lg" />

      {/* Event Details Skeleton */}
      <div className="flex-1 space-y-4 py-1">
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="flex items-center space-x-2 gap-5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Bookmark Icon Skeleton */}
      <div className="ml-auto flex items-center">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
};

export default SkeletonEventCard;
