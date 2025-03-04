// app/pendingApproval/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="font-sans min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <div className="text-2xl font-bold text-white">
          <Link href="/">Driving School</Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center bg-gray-100 pt-24">
        <div className="w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold mb-4 text-center text-black">Pending Approval</h1>
          <p className="text-center mb-6 text-gray-700">
            Your account is currently pending approval by an administrator. Once your account is approved, you will be able to log in.
          </p>
          <div className="text-center">
            <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Return to Home
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-green-900 text-white py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold">Driving School</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {["Features", "Pricing", "FAQ", "Privacy Policy", "Terms of Service"].map(
              (link, index) => (
                <a key={index} href="#" className="hover:text-white transition">
                  {link}
                </a>
              )
            )}
          </div>
          <div className="flex space-x-4 mt-6 md:mt-0">
            {["facebook", "twitter", "instagram"].map((icon, index) => (
              <a key={index} href="#" className="hover:text-white transition">
                <img src={`/${icon}.svg`} alt={icon} className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
        <div className="text-center text-sm mt-6">
          © 2025 Driving School. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
