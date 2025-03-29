"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReservationDetails() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      // Redirect with date & time as query params
      router.push(
        `/instructor-list?date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
      );
    } else {
      alert("Please select both a date and time.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Book a Lesson</h2>
      <form onSubmit={handleConfirmBooking} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Select Time</label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}