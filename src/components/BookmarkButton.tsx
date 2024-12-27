"use client";

import { useState } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const variantClasses = {
    default: 'bg-white/90 hover:bg-white shadow-sm',
    card: 'bg-black/50 hover:bg-black/60 backdrop-blur-sm',
    detail: 'bg-gray-100 hover:bg-gray-200'
  };

  const handleBookmark = async () => {
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
        // Show toast notification
        const message = isBookmarked ? 'Event removed from bookmarks' : 'Event bookmarked';
        // You can implement a toast notification system here
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
      className={`
        ${variantClasses[variant]}
        p-2 rounded-full transition-all duration-200 ease-in-out
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${variant === 'card' ? 'text-white' : 'text-gray-700'}
      `}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {isBookmarked ? (
        <BookmarkIconSolid className={`${sizeClasses[size]} ${variant === 'card' ? 'text-white' : 'text-blue-600'}`} />
      ) : (
        <BookmarkIcon className={sizeClasses[size]} />
      )}
    </button>
  );
} 