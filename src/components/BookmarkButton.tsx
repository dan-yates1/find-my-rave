"use client";

import { useState } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

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
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push('/login-register');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        queryClient.invalidateQueries({ queryKey: ['bookmarkedEvents'] });
        queryClient.invalidateQueries({ queryKey: ['eventHistory'] });
        queryClient.invalidateQueries({ queryKey: ['bookmarkStatus', eventId] });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`rounded-full p-2 ${variantClasses[variant]} transition-all duration-200`}
    >
      {isBookmarked ? (
        <BookmarkIconSolid className={`${sizeClasses[size]} text-blue-600`} />
      ) : (
        <BookmarkIcon className={`${sizeClasses[size]} text-gray-500`} />
      )}
    </button>
  );
} 