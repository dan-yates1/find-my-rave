import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">RaveMap</h3>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Essential Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/find-events" className="text-gray-400 hover:text-blue-600 transition-colors">
                  Find Events
                </Link>
              </li>
              <li>
                <Link href="/create-event" className="text-gray-400 hover:text-blue-600 transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-blue-600 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-4">
          <p className="text-gray-400 text-xs text-center">
            © {new Date().getFullYear()} Find My Rave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 