"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

// ... existing code ...

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  const handleSearch = ({
    input,
    location,
  }: {
    input: string;
    location: string;
  }) => {
    console.log("Search for:", input, "in location:", location);
  };

  return (
    <nav className="border-b border-gray-200 shadow-sm">
      <div className="px-5 lg:px-10 mx-auto flex items-center justify-between py-4">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-blue-600 font-black text-xl">
          FINDMYRAVE
        </Link>

        {/* Integrated Search Bar for Desktop */}
        <div className="flex-grow mx-8 hidden lg:block">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link
            href="/find-events"
            className="text-gray-700 hover:text-gray-900"
          >
            Find Events
          </Link>
          <Link
            href="/create-event"
            className="text-gray-700 hover:text-gray-900"
          >
            Create Event
          </Link>
          {session?.user?.image ? (
            <Image
              alt="Profile picture"
              src={session.user.image}
              width={100}
              height={100}
              className="rounded-full w-12 h-12"
              onClick={() => signOut()}
            />
          ) : (
            session && (
              <div
                onClick={() => signOut()}
                style={{
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#ccc",
                  borderRadius: "50%",
                }}
              >
                {session?.user?.name?.charAt(0)}
              </div>
            )
          )}
          {!session && (
            <>
              <Link
                href="/login-register"
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Up
              </Link>
              <Link
                href="/login-register"
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden px-5 pb-4">
          <div className="flex flex-col space-y-4">
            <Link
              href="/find-events"
              className="text-gray-700 hover:text-gray-900"
            >
              Find Events
            </Link>
            {session?.user?.image ? (
              <Image
                alt="Profile picture"
                src={session.user.image}
                width={32}
                height={32}
                className="rounded-full"
                onClick={() => signOut()}
              />
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
              </>
            )}
            <Link
              href="/create-event"
              className="text-gray-700 hover:text-gray-900"
            >
              Create Event
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      )}
    </nav>
  );
}
