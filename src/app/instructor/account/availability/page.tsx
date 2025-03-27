"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function Availability() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const [date, setDate] = useState<Date>(new Date()); // Currently selected date
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);
  const [savedTimeRanges, setSavedTimeRanges] = useState<{ date: string; startTime: string; endTime: string }[]>([]);
  const [error] = useState("");

  // Fetch saved availability from Firestore
  useEffect(() => {
    const fetchAvailability = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const availability = userDoc.data().availability || [];
        setSavedTimeRanges(Array.isArray(availability) ? availability : []);
      } else {
        setSavedTimeRanges([]); // Default to empty array if no data
      }
    };

    fetchAvailability();
  }, []); // Runs once on mount

  // Sync date and time range with URL params or saved data
  useEffect(() => {
    const dateStr = dateParam && !isNaN(new Date(dateParam).getTime()) ? dateParam : new Date().toISOString().split("T")[0];
    const newDate = new Date(dateStr);

    // Only update date if it’s different
    if (newDate.getTime() !== date.getTime()) {
      setDate(newDate);
    }

    if (startParam && endParam) {
      setSelectedTimeRange({ start: startParam, end: endParam });
    } else {
      // Ensure savedTimeRanges is an array before calling find
      const savedRange = Array.isArray(savedTimeRanges)
        ? savedTimeRanges.find((range) => range.date === dateStr)
        : null;
      setSelectedTimeRange(savedRange ? { start: savedRange.startTime, end: savedRange.endTime } : null);
    }
  }, [dateParam, startParam, endParam, savedTimeRanges]);

  // Handle calendar date change
  const handleDateChange = (value: Date | [Date, Date] | null) => {
    if (Array.isArray(value)) {
      setDate(value[0]); // Take the first date if multiple are selected (not fully supported yet)
    } else if (value instanceof Date) {
      setDate(value);
    }

    // Update selected time range based on saved data for the new date
    const selectedDateStr = value instanceof Date ? value.toISOString().split("T")[0] : "";
    const savedRange = Array.isArray(savedTimeRanges)
      ? savedTimeRanges.find((range) => range.date === selectedDateStr)
      : null;
    setSelectedTimeRange(savedRange ? { start: savedRange.startTime, end: savedRange.endTime } : null);
  };

  // Function to navigate back to the dashboard
  const handleBackToDashboard = () => {
    router.push("/instructor");
  };

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Set Availability</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <Calendar
              onChange={handleDateChange}
              value={date}
              className="mb-4"
            />
            {selectedTimeRange ? (
              <p className="text-center mb-4">
                <strong>Selected Time:</strong> {selectedTimeRange.start} - {selectedTimeRange.end}
              </p>
            ) : (
              <p className="text-center mb-4">No time range set for {date.toDateString()}.</p>
            )}
            <button
              onClick={() => router.push(`/instructor/account/availability/time-range?date=${date.toISOString().split("T")[0]}`)}
              className="w-full mt-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Set Time Range
            </button>
            <button
              onClick={handleBackToDashboard}
              className="w-full mt-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}