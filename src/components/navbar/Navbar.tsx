"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = ({
    input,
    location,
  }: {
    input: string;
    location: string;
  }) => {
    const searchParams = new URLSearchParams({
      event: input,
      location: location,
    });
    router.push(`/find-events?${searchParams.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="text-blue-600 font-black text-xl">
              FINDMYRAVE
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:items-center lg:flex lg:flex-1 lg:justify-center lg:max-w-3xl lg:px-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Navigation and Profile - Desktop */}
          <div className="hidden lg:flex lg:items-center">
            <div className="flex items-center space-x-8">
              <Link
                href="/find-events"
                className="text-[#39364F] font-medium hover:text-[#1a1f2e] transition-colors"
              >
                Find Events
              </Link>
              <Link
                href="/create-event"
                className="text-[#39364F] font-medium hover:text-[#1a1f2e] transition-colors"
              >
                Create Events
              </Link>
              {session?.user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
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
                      <div className="w-[40px] h-[40px] rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                        {session.user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{session.user.name || 'User'}</p>
                        <p className="text-sm text-gray-500">{session.user.email || ''}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <UserCircleIcon className="w-4 h-4" />
                          <span>My Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login-register"
                  className="text-[#39364F] font-medium hover:text-[#1a1f2e]"
                >
                  Sign In/Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
