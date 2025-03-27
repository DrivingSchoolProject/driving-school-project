/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";
import { Booking } from "@/types";
import { subscribeToBookings } from "@/utils/realTime";

// Convert Firestore Timestamp or string to Date
const toDate = (input: any): Date => {
  if (input instanceof Timestamp) {
    return input.toDate();
  }
  if (typeof input === "string") {
    return new Date(Date.parse(input));
  }
  console.error("Invalid date input:", input);
  return new Date(0);
};

// Convert timestamp to YYYY-MM-DD format
const timestampToString = (timestamp: any): string => {
  const date = toDate(timestamp);
  return isNaN(date.getTime()) ? "Invalid Date" : date.toISOString().split("T")[0];
};

// Extract time in HH:MM AM/PM format
const extractTime = (input: any): string => {
  const date = toDate(input);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const unsubscribe = subscribeToBookings(user.uid, "instructor", (bookingList) => {
      console.log("Booking list from subscribeToBookings:", bookingList);

      const mappedBookings = bookingList.map((booking: any, index: number) => {
        console.log("Processing booking:", booking);
        return {
          id: `${booking.studentId}-${index}`,
          studentId: booking.studentId,
          studentName: booking.studentEmail,
          studentEmail: booking.studentEmail,
          lessonType: booking.courseType,
          date: timestampToString(booking.date || booking.createdAt),
          time: booking.time || extractTime(booking.date || booking.createdAt),
          status: booking.status || "pending",
          paymentStatus: booking.paymentStatus || "pending",
          notes: booking.notes || "",
          basePrice: booking.basePrice || 0,
          taxAmount: booking.taxAmount || 0,
          totalPrice: booking.totalPrice || 0,
          createdAt: timestampToString(booking.createdAt),
          instructorId: booking.instructorId || user.uid,
          rawDate: booking.date || booking.createdAt, // Store raw date for filtering
        };
      });

      // Filter for upcoming bookings
      const now = new Date();
      const upcomingBookings = mappedBookings.filter((booking) => {
        if (!booking.rawDate) {
          console.error("Booking missing rawDate:", booking);
          return false;
        }
        const bookingDate = toDate(booking.rawDate);
        return bookingDate >= now && booking.status !== "cancelled" && booking.status !== "completed";
      });

      // Sort by date (earliest first)
      upcomingBookings.sort((a, b) => toDate(a.rawDate).getTime() - toDate(b.rawDate).getTime());

      setBookings(upcomingBookings);
      setLoading(false);

      // Fetch student names asynchronously
      upcomingBookings.forEach(async (booking) => {
        if (booking.studentName.includes("@")) {
          const studentRef = doc(db, "users", booking.studentId);
          const studentSnap = await getDoc(studentRef);
          if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            booking.studentName = `${studentData.firstName || "Unknown"} ${studentData.lastName || "Student"}`;
            setBookings([...upcomingBookings]);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Bookings</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            {bookings.length === 0 ? (
              <p>No upcoming bookings available.</p>
            ) : (
              <ul className="space-y-4">
                {bookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                    onClick={() => router.push(`/instructor/bookings/${booking.id}`)}
                  >
                    {booking.studentName} - {booking.lessonType} on {booking.date} at {booking.time} ({booking.status})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        <Footer />
        <button
          onClick={() => router.push("/instructor")}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition z-50"
        >
          Dashboard
        </button>
      </div>
    </ProtectedRoute>
  );
}