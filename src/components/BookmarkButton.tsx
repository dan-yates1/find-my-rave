"use client";

import { useState, useEffect } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface BookmarkButtonProps {
  eventId: string;
  initialIsBookmarked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'detail';
}

export default function BookmarkButton({ 
  eventId, 
  initialIsBookmarked = false,
  size = 'md',
  variant = 'default'
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query to manage bookmark state
  const { data: bookmarkStatus, isLoading } = useQuery({
    queryKey: ['bookmarkStatus', eventId],
    queryFn: async () => {
      if (!session) return false;
      const response = await fetch(`/api/bookmarks/check/${eventId}`);
      const data = await response.json();
      return data.isBookmarked;
    },
    initialData: initialIsBookmarked,
  });

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push('/login-register');
      return;
    }

    try {
      const response = await fetch('/api/bookmarks', {
        method: bookmarkStatus ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['bookmarkStatus', eventId] });
        queryClient.invalidateQueries({ queryKey: ['bookmarkedEvents'] });
        queryClient.invalidateQueries({ queryKey: ['eventHistory'] });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const variantClasses = {
    default: 'bg-white/90 hover:bg-white shadow-sm',
    card: 'bg-white/90 hover:bg-white/100',
    detail: 'bg-gray-100 hover:bg-gray-200'
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`rounded-full p-2 transition-colors ${variantClasses[variant]}`}
    >
      {bookmarkStatus ? (
        <BookmarkIconSolid className={`${sizeClasses[size]} text-blue-600`} />
      ) : (
        <BookmarkIcon className={`${sizeClasses[size]} text-gray-600`} />
      )}
    </button>
  );
} 