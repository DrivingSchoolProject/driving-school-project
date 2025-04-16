"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="font-sans min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
          <button
            onClick={() => router.push("/admin/settings")}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Settings
          </button>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gray-100 pt-24 px-4 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <button
              onClick={() => router.push("/admin/messages/students")}
              className="p-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Messages from Students
            </button>
            <button
              onClick={() => router.push("/admin/messages/instructors")}
              className="p-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Messages from Instructors
            </button>
            <button
              onClick={() => router.push("/admin/onboarding")}
              className="p-4 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition"
            >
              Onboarding Requests
            </button>
            <button
              onClick={() => router.push("/admin/database")}
              className="p-4 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
            >
              Database Overview
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
