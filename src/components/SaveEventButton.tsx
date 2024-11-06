"use client";

import { useState, useEffect } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveEventButtonProps {
  eventId: string;
  initialSaved?: boolean;
  className?: string;
}

const SaveEventButton = ({ eventId, initialSaved = false, className = '' }: SaveEventButtonProps) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkIfSaved = async () => {
      if (session) {
        try {
          const response = await fetch('/api/user/check-saved-events');
          if (response.ok) {
            const { savedEventIds } = await response.json();
            setIsSaved(savedEventIds.includes(eventId));
          }
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };

    checkIfSaved();
  }, [eventId, session]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent event bubbling if used in a card
    
    if (!session) {
      router.push('/login-register');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/save-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          action: isSaved ? 'unsave' : 'save',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      setIsSaved(!isSaved);
      router.refresh();
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
      className={`
        p-2 rounded-full transition-colors duration-200
        ${isSaved 
          ? 'text-blue-500' 
          : 'text-gray-600 hover:bg-gray-100'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={isSaved ? "Remove from saved" : "Save event"}
    >
      {isLoading ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      ) : isSaved ? (
        <BookmarkSolidIcon className="w-5 h-5" />
      ) : (
        <BookmarkIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default SaveEventButton;
