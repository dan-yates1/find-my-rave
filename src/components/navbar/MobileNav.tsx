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
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = ({ input, location }: { input: string; location: string }) => {
    const searchParams = new URLSearchParams();
    if (input) searchParams.set("event", input);
    if (location) searchParams.set("location", location);
    
    router.push(`/find-events?${searchParams.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
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
        {/* Menu Panel - Made wider and added better spacing */}
        <div 
          className={`fixed inset-y-0 right-0 w-[85%] max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header with Logo */}
          <div className="p-4 border-b flex items-center justify-between">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <span className="text-xl font-black text-blue-600">FINDMYRAVE</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar - Improved spacing */}
          <div className="p-4 border-b bg-gray-50">
            <SearchBar
              onSearch={handleSearch}
              className="!px-0"
              compact
            />
          </div>

          {/* Navigation Links - Better spacing and visual hierarchy */}
          <nav className="px-4 py-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 px-2 mb-2">MENU</h3>
            <Link
              href="/find-events"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <MapIcon className="w-5 h-5" />
              Find Events
            </Link>
            <Link
              href="/create-event"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <PlusCircleIcon className="w-5 h-5" />
              Create Event
            </Link>
          </nav>

          {/* User Section - Improved styling */}
          <div className="border-t mt-auto">
            <div className="p-4 bg-gray-50">
              {session?.user ? (
                <div className="space-y-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
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
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login-register"
                  className="flex items-center gap-2 text-blue-600 font-medium p-2 hover:bg-white rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 