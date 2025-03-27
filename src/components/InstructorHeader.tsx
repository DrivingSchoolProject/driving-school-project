"use client";

import React, { useState } from "react";
import Link from "next/link";
import { auth } from "@/library/firebase";
import { signOut } from "firebase/auth";

interface InstructorHeaderProps {
  fullName: string;
}

const InstructorHeader: React.FC<InstructorHeaderProps> = ({ fullName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
      <div className="text-2xl font-bold text-white">
        <Link href="/">Driving School</Link>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 text-white"
        >
          <span>{fullName}</span>
          <img src="/DSC_1403.JPG" alt="Account" className="w-6 h-6" /> {/* Add an icon */}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg">
            <Link href="/instructor/account/contact-info" className="block px-4 py-2 text-black hover:bg-gray-100">
              Contact Info
            </Link>
            <Link href="/instructor/account/professional-details" className="block px-4 py-2 text-black hover:bg-gray-100">
              Professional Details
            </Link>
            <Link href="/instructor/account/lesson-prices" className="block px-4 py-2 text-black hover:bg-gray-100">
              Set Lesson Prices
            </Link>
            <Link href="/instructor/account/availability" className="block px-4 py-2 text-black hover:bg-gray-100">
              Set Availability
            </Link>
            <Link href="/instructor/account/earnings" className="block px-4 py-2 text-black hover:bg-gray-100">
              Earnings
            </Link>
            <Link href="/instructor/account/lesson-history" className="block px-4 py-2 text-black hover:bg-gray-100">
              Lesson History
            </Link>
            <Link href="/instructor/account/reviews" className="block px-4 py-2 text-black hover:bg-gray-100">
              Reviews
            </Link>
            <Link href="/instructor/account/payment-method" className="block px-4 py-2 text-black hover:bg-gray-100">
              Payment Method
            </Link>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-black hover:bg-gray-100">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default InstructorHeader;