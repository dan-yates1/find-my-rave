"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { createPortal } from 'react-dom';
import Link from "next/link";

interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInPromptModal({ isOpen, onClose }: SignInPromptModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[999] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-xl p-6 z-[1000] shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sign in required</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          To save events and access your favorites, you&apos;ll need to sign in or create an account.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link
            href="/login-register"
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Sign in
          </Link>
          <Link
            href="/login-register"
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Create account
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
} 