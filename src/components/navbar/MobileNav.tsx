"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  MapIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      >
        {/* Menu Panel */}
        <div 
          className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-4">
            <Link
              href="/find-events"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <MapIcon className="w-5 h-5" />
              Find Events
            </Link>
            <Link
              href="/create-event"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <PlusCircleIcon className="w-5 h-5" />
              Create Event
            </Link>
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            {session?.user ? (
              <div className="space-y-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-10 h-10" />
                  )}
                  <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login-register"
                className="flex items-center gap-2 text-blue-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <UserCircleIcon className="w-5 h-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 