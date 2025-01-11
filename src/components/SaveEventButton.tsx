"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import SignInPromptModal from './SignInPromptModal';
import { useSession } from 'next-auth/react';

interface SaveEventButtonProps {
  eventId: string;
  eventData?: any;
}

export default function SaveEventButton({ eventId, eventData }: SaveEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ['savedEvent', eventId],
    queryFn: async () => {
      if (!session) return { isSaved: false };
      const response = await fetch(`/api/user/events?mode=ids`);
      if (!response.ok) throw new Error('Failed to check saved status');
      const data = await response.json();
      return { isSaved: data.savedEventIds.includes(eventId) };
    },
    enabled: !!session,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session) {
        setShowSignInPrompt(true);
        return;
      }
      
      setIsLoading(true);
      const response = await fetch('/api/user/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          action: data?.isSaved ? 'unsave' : 'save',
          eventData,
        }),
      });
      if (!response.ok) throw new Error('Failed to update save status');
      return response.json();
    },
    onSuccess: () => {
      if (session) {
        queryClient.invalidateQueries({ queryKey: ['savedEvent', eventId] });
        queryClient.invalidateQueries({ queryKey: ['savedEvents'] });
      }
    },
    onSettled: () => setIsLoading(false),
  });

  return (
    <>
      <button
        onClick={() => mutation.mutate()}
        disabled={isLoading}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        aria-label={data?.isSaved ? 'Unsave event' : 'Save event'}
      >
        {data?.isSaved ? (
          <HeartSolidIcon className="w-6 h-6 text-red-600" />
        ) : (
          <HeartIcon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      <SignInPromptModal 
        isOpen={showSignInPrompt} 
        onClose={() => setShowSignInPrompt(false)} 
      />
    </>
  );
}
