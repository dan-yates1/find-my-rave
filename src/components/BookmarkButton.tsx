"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import SignInPromptModal from './SignInPromptModal';
import { useSession } from 'next-auth/react';

interface BookmarkButtonProps {
  eventId: string;
  initialIsBookmarked?: boolean;
  variant: "default" | "compact" | "detail";
  size: "sm" | "lg";
}

export default function BookmarkButton({ 
  eventId, 
  initialIsBookmarked = false,
  variant = 'default',
  size = 'sm'
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: bookmarkData } = useQuery({
    queryKey: ['bookmark', eventId],
    queryFn: async () => {
      if (!session) return { isBookmarked: false };
      const response = await fetch(`/api/bookmarks/check/${eventId}`);
      if (!response.ok) throw new Error('Failed to check bookmark status');
      return response.json();
    },
    initialData: { isBookmarked: initialIsBookmarked },
    enabled: !!session,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session) {
        setShowSignInPrompt(true);
        return;
      }

      setIsLoading(true);
      const method = bookmarkData.isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch('/api/bookmarks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (!response.ok) throw new Error('Failed to update bookmark');
      return response.json();
    },
    onSuccess: () => {
      if (session) {
        queryClient.invalidateQueries({ queryKey: ['bookmark', eventId] });
        queryClient.invalidateQueries({ queryKey: ['bookmarkedEvents'] });
      }
    },
    onSettled: () => setIsLoading(false),
  });

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();  // Prevent Link navigation
          e.stopPropagation(); // Stop event bubbling
          mutation.mutate();
        }}
        disabled={isLoading}
        className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label={bookmarkData.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {bookmarkData.isBookmarked ? (
          <BookmarkSolidIcon className="w-5 h-5 text-blue-600" />
        ) : (
          <BookmarkIcon className="w-5 h-5" />
        )}
      </button>

      <SignInPromptModal 
        isOpen={showSignInPrompt} 
        onClose={() => setShowSignInPrompt(false)} 
      />
    </>
  );
} 