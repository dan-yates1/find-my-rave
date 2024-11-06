"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import MobileNav from "./MobileNav";

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
    <header className="sticky top-0 z-50 bg-white border-b py-1 border-gray-200">
      <nav className="mx-auto px-8 sm:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-black text-blue-600">FINDMYRAVE</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 justify-center px-16">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <MobileNav />
          </div>

          {/* Navigation and Profile - Desktop */}
          <div className="hidden lg:flex lg:items-center flex-shrink-0">
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <UserCircleIcon className="w-6 h-6" />
                    </div>
                  )}
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                    {session?.user ? (
                      <>
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
                      </>
                    ) : (
                      <Link
                        href="/login-register"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Sign In/Register
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
