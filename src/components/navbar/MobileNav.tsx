"use client";

import { useState, useEffect } from "react";
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
import { useRouter, usePathname } from "next/navigation";

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationVisible, setIsLocationVisible] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = ({ input, location }: { input: string; location: string }) => {
    const searchParams = new URLSearchParams();
    if (input) searchParams.set("event", input);
    if (location) searchParams.set("location", location);
    
    router.push(`/find-events?${searchParams.toString()}`);
    setIsLocationVisible(false);
  };

  // Reset location visibility when component mounts or route changes
  useEffect(() => {
    setIsLocationVisible(false);
  }, [pathname]);

  const handleFocus = () => {
    setIsLocationVisible(true);
  };

  const handleBlur = () => {
    // Add a small delay to allow for click events to complete
    setTimeout(() => {
      setIsLocationVisible(false);
    }, 200);
  };

  return (
    <div className="lg:hidden">
      {/* Main Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-black text-blue-600">FINDMYRAVE</span>
          </Link>
          
          <div className="relative">
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsLocationVisible(false);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                {/* Overlay for closing menu */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 transform origin-top-right transition-all duration-200 ease-out">
                  {/* User Section */}
                  {session?.user ? (
                    <div className="p-4 border-b">
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
                          <div className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{session.user.name}</p>
                          <p className="text-sm text-gray-500">{session.user.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login-register"
                      className="block p-4 border-b text-blue-600 font-medium hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}

                  {/* Navigation Links */}
                  <nav className="py-2">
                    <Link
                      href="/find-events"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MapIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Find Events</span>
                    </Link>
                  </nav>

                  {/* Sign Out Button */}
                  {session?.user && (
                    <div className="border-t">
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="px-4 pb-3">
          <SearchBar
            onSearch={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            compact
            isLocationVisible={isLocationVisible}
          />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[88px]" />
    </div>
  );
} 