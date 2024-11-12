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
  iconClassName = "w-6 h-6",
}: SaveEventButtonProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [showPrompt, setShowPrompt] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      setShowPrompt(true);
      return;
    }

    try {
      const response = await fetch("/api/user/save-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          action: isSaved ? "unsave" : "save",
          eventData,
        }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        // Invalidate the saved events query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['savedEvents'] });
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  return (
    <>
      <button
        onClick={handleSave}
        className={`relative ${className}`}
        aria-label={isSaved ? "Unsave event" : "Save event"}
      >
        {isSaved ? (
          <BookmarkSolidIcon className={`text-blue-600 ${iconClassName}`} />
        ) : (
          <BookmarkIcon className={`text-gray-600 hover:text-blue-600 ${iconClassName}`} />
        )}
      </button>

      {/* Login Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 relative">
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4">Create an Account</h3>
            <p className="text-gray-600 mb-6">
              To save events and access more features, please create an account or sign in.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPrompt(false);
                  router.push('/login-register');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In / Register
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveEventButton;
