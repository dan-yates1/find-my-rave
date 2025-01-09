"use client";

import { useState } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BookmarkButtonProps {
  eventId: string;
  initialIsBookmarked?: boolean;
  variant?: 'default' | 'detail';
  size?: 'default' | 'lg';
}

export default function BookmarkButton({ 
  eventId, 
  initialIsBookmarked = false,
  variant = 'default',
  size = 'default'
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: bookmarkData } = useQuery({
    queryKey: ['bookmark', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/bookmarks/check/${eventId}`);
      if (!response.ok) throw new Error('Failed to check bookmark status');
      return response.json();
    },
    initialData: { isBookmarked: initialIsBookmarked },
  });

  const mutation = useMutation({
    mutationFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ['bookmark', eventId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarkedEvents'] });
    },
    onSettled: () => setIsLoading(false),
  });

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
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
  );
} 