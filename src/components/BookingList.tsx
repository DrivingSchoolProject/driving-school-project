"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/library/firebase";
import { Booking } from "@/types";
import { subscribeToBookings } from "@/utils/realTime";

const BookingList: React.FC = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToBookings(user.uid, "instructor", (bookingList) => {
      setBookings(bookingList.map((booking) => ({
        id: booking.id,
        studentName: booking.studentName as string,
        lessonType: booking.lessonType as string,
        date: booking.date as string,
        status: booking.status as string,
        paymentStatus: booking.paymentStatus as string,
      } as Booking)));
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  return (
    <div
      className="p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition"
      onClick={() => router.push("/instructor/bookings")}
    >
      <h2 className="text-xl font-semibold mb-4">Bookings</h2>
      {bookings.length === 0 ? (
        <p>No upcoming bookings.</p>
      ) : (
        <ul className="space-y-2">
          {bookings.slice(0, 3).map((booking) => (
            <li key={booking.id} className="p-2 bg-gray-100 rounded">
              {booking.studentName} - {booking.lessonType} on {booking.date} ({booking.status}, {booking.paymentStatus})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingList;