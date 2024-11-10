"use client";

import { useState, useEffect } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Event } from "@prisma/client";
import { useQueryClient } from '@tanstack/react-query';

interface SaveEventButtonProps {
  eventId: string;
  eventData?: Partial<Event>;
  initialSaved?: boolean;
  className?: string;
  iconClassName?: string;
}

const SaveEventButton = ({ 
  eventId, 
  eventData,
  initialSaved = false,
  className = "",
  iconClassName = "w-5 h-5"
}: SaveEventButtonProps) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch('/api/user/check-saved-events');
        const data = await response.json();
        setIsSaved(data.savedEventIds?.includes(eventId) || false);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [session?.user?.email, eventId]);

  const handleSave = async () => {
    if (!session) {
      router.push('/login-register');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/save-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventData,
          action: isSaved ? 'unsave' : 'save',
        }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        // Invalidate and refetch savedEvents query
        queryClient.invalidateQueries({ queryKey: ['savedEvents'] });
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`${className} disabled:opacity-50`}
      aria-label={isSaved ? "Unsave event" : "Save event"}
    >
      {isSaved ? (
        <BookmarkSolidIcon className={iconClassName} />
      ) : (
        <BookmarkIcon className={iconClassName} />
      )}
    </button>
  );
};

export default SaveEventButton;