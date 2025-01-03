"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import MobileNav from "./MobileNav";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { data: session, update: updateSession } = useSession();
  const [userImage, setUserImage] = useState(session?.user?.image);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(({
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
    window.location.href = `/find-events?${searchParams.toString()}`;
  }, []);

  const handleProfileClick = () => setShowProfileMenu(!showProfileMenu);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
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

  useEffect(() => {
    const fetchUserImage = async () => {
      if (session?.user?.email) {
        const response = await fetch(`/api/user/profile?email=${session.user.email}`);
        if (response.ok) {
          const userData = await response.json();
          setUserImage(userData.image);
          if (userData.image !== session.user.image) {
            await updateSession({
              ...session.user,
              image: userData.image,
            });
          }
        }
      }
    };

    fetchUserImage();
  }, [session?.user?.email]);

  // Update local state when session changes
  useEffect(() => {
    setUserImage(session?.user?.image);
  }, [session?.user?.image]);

  const ProfileMenu = () => (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
      {session?.user ? (
        <>
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{session.user.name || 'User'}</p>
            <p className="text-sm text-gray-500">{session.user.email || ''}</p>
          </div>
          <Link
            href="/profile"
            className={cn(
              "block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100",
              "flex items-center space-x-2"
            )}
            onClick={() => setShowProfileMenu(false)}
          >
            <UserCircleIcon className="w-4 h-4" />
            <span>My Profile</span>
          </Link>
          <button
            onClick={handleSignOut}
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
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Desktop Navigation */}
      <nav className="hidden lg:block mx-auto px-4 py-1 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-3">
            <span className="text-xl font-black text-blue-600">FINDMYRAVE</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Navigation and Profile - Desktop */}
          <div className="flex items-center space-x-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 ml-2 text-gray-500 hover:text-gray-600"
              >
                {session?.user ? (
                  userImage ? (
                    <Image
                      src={userImage}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                      priority={true}
                    />
                  ) : (
                    <div className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )
                ) : (
                  <div className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </button>
              {showProfileMenu && <ProfileMenu />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav />
    </header>
  );
}
