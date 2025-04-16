"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 bg-gray-100">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <div className="text-2xl font-bold text-white">
          <Link href="/admin">⬅ Back to Dashboard</Link>
        </div>
      </header>

      {/* SETTINGS CONTENT */}
      <main className="w-full max-w-3xl p-6 mt-16 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
        
        <div className="space-y-4">
          <p className="text-gray-700">🔧 Settings page coming soon!</p>
          {/* Add settings options here */}
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
