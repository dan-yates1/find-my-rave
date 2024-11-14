import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonEventCard = () => {
  return (
    <div className="relative h-full bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <div className="relative w-full pt-[56.25%] bg-gray-200 animate-pulse"></div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date skeleton */}
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />

        {/* Title skeleton - two lines */}
        <div className="space-y-2">
          <div className="w-full h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-2/3 h-5 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonEventCard;
