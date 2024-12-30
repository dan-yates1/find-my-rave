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
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-black text-blue-600">FINDMYRAVE</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <Link href="/profile">
              {session.user.image ? (
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
            </Link>
          ) : (
            <Link href="/login-register">
              <UserCircleIcon className="w-6 h-6 text-gray-500" />
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500"
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link
            href="/find-events"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            Find Events
          </Link>
          {session?.user && (
            <>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
} 