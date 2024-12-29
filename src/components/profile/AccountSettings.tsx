"use client";

import { Input } from "../ui/input";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountSettings() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email }),
      });
      
      if (response.ok) {
        await updateSession({ name: displayName });
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/login-register');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
      
      {/* Profile Settings */}
      <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
        <div>
          <label className="text-sm font-medium">Display Name</label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Save Changes
        </button>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="space-y-4 mb-8">
        <h3 className="text-lg font-medium">Change Password</h3>
        <div>
          <label className="text-sm font-medium">Current Password</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Change Password
        </button>
      </form>

      {/* Delete Account */}
      <div className="pt-4 border-t">
        <button
          onClick={handleDeleteAccount}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
} 