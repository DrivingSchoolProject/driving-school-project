"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function TimeRangeSelection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  ];

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      setError("Please select a start and end time.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef); // Fetch existing data
      const existingAvailability = userDoc.exists() ? userDoc.data().availability : [];

      // Ensure existingAvailability is an array
      const availabilityArray = Array.isArray(existingAvailability) ? existingAvailability : [];

      // Check if an entry for this date already exists
      type AvailabilityEntry = { date: string; startTime: string; endTime: string };
      const existingEntryIndex = availabilityArray.findIndex((entry: AvailabilityEntry) => entry.date === date);

      let newAvailability;
      if (existingEntryIndex !== -1) {
        // Update the existing entry
        newAvailability = [...availabilityArray];
        newAvailability[existingEntryIndex] = { date, startTime, endTime };
      } else {
        // Append a new entry
        newAvailability = [...availabilityArray, { date, startTime, endTime }];
      }

      // Update Firestore with the new or updated availability array
      await updateDoc(userRef, { availability: newAvailability });

      // Redirect with selected time range as query parameters
      router.push(`/instructor/account/availability?date=${date}&start=${startTime}&end=${endTime}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  // Function to navigate back to the availability page
  const handleBack = () => {
    router.push(`/instructor/account/availability?date=${date}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Select Time Range</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <label className="block mb-2 font-semibold">Start Time:</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        >
          <option value="">Select Start Time</option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">End Time:</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        >
          <option value="">Select End Time</option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save
          </button>
          <button
            onClick={handleBack}
            className="flex-1 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}