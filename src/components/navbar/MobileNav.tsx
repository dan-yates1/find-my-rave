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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationVisible, setIsLocationVisible] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = ({ input, location }: { input: string; location: string }) => {
    const searchParams = new URLSearchParams();
    if (input) searchParams.set("event", input);
    if (location) searchParams.set("location", location);
    
    router.push(`/find-events?${searchParams.toString()}`);
    setIsLocationVisible(false);
  };

  const handleBlur = () => {
    setIsLocationVisible(false);
  };

  return (
    <div className="lg:hidden">
      {/* Main Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <Link href="/" className="ml-2">
            <span className="text-xl font-black text-blue-600">FINDMYRAVE</span>
          </Link>
        </div>

        {/* Search Section */}
        <div className="px-4 pb-3">
          <SearchBar
            onSearch={handleSearch}
            onFocus={() => setIsLocationVisible(true)}
            onBlur={handleBlur}
            isLocationVisible={isLocationVisible}
            compact
          />
        </div>
      </div>

      {/* Slide-out Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
        
        <div
          className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-white transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-xl font-black text-blue-600">MENU</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="overflow-y-auto h-[calc(100%-64px)]">
            {session?.user ? (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b">
                <Link
                  href="/login-register"
                  className="flex items-center space-x-2 text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-4 space-y-4">
              <Link
                href="/find-events"
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Find Events</span>
              </Link>
              
              <Link
                href="/create-event"
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircleIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Create Event</span>
              </Link>
            </nav>

            {/* Sign Out Button */}
            {session?.user && (
              <div className="p-4 border-t mt-auto">
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-red-600 hover:text-red-700 p-3 hover:bg-gray-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[88px]" />
    </div>
  );
} 