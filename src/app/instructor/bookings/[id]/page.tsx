/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Booking, StudentPreferences } from "@/types";

import { Timestamp } from "firebase/firestore";

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

const timestampToString = (timestamp: any): string => {
  const date = toDate(timestamp);
  return isNaN(date.getTime()) ? "Invalid Date" : date.toISOString().split("T")[0];
};

const extractTime = (input: any): string => {
  const date = toDate(input);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [studentPreferences, setStudentPreferences] = useState<StudentPreferences | null>(null);
  const [notes, setNotes] = useState("");
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async (user: any) => {
      if (!user) {
        router.push("/login");
        setLoading(false);
        return;
      }

      if (!id) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const [studentId, bookingIndex] = (id as string).split("-");
        const instructorRef = doc(db, "users", user.uid);
        const instructorSnap = await getDoc(instructorRef);

        if (!instructorSnap.exists()) {
          setError("Instructor profile not found.");
          setLoading(false);
          return;
        }

        const instructorData = instructorSnap.data();
        const bookings = instructorData.bookings || [];
        console.log("Instructor bookings:", bookings);

        if (bookingIndex >= bookings.length) {
          setError("Booking index out of bounds.");
          setLoading(false);
          return;
        }

        const bookingData = bookings[parseInt(bookingIndex)];
        console.log("Booking data:", bookingData);

        if (!bookingData || bookingData.studentId !== studentId) {
          setError("Booking not found or unauthorized.");
          setLoading(false);
          return;
        }

        // Since instructorId might be missing, assume the current user is the instructor
        const instructorId = bookingData.instructorId || user.uid;

        if (instructorId !== user.uid) {
          setError("Unauthorized access to this booking.");
          setLoading(false);
          return;
        }

        const studentRef = doc(db, "users", studentId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists() || studentSnap.data().role !== "student") {
          setError("Student profile not found.");
          setLoading(false);
          return;
        }

        const studentData = studentSnap.data();
        const booking: Booking = {
          id: `${studentId}-${bookingIndex}`,
          studentId,
          studentName: `${studentData.firstName || "Unknown"} ${studentData.lastName || "Student"}`,
          studentEmail: bookingData.studentEmail || studentData.email || "Unknown Email",
          lessonType: bookingData.courseType || "Unknown Lesson",
          date: timestampToString(bookingData.date || bookingData.createdAt),
          time: bookingData.time || extractTime(bookingData.date || bookingData.createdAt),
          status: bookingData.status || "pending",
          paymentStatus: bookingData.paymentStatus || "pending",
          notes: bookingData.notes || "",
          basePrice: bookingData.basePrice || 0,
          taxAmount: bookingData.taxAmount || 0,
          totalPrice: bookingData.totalPrice || 0,
          createdAt: timestampToString(bookingData.createdAt),
          instructorId: instructorId,
        };

        setBooking(booking);
        setNotes(booking.notes || "");
        setStudentPreferences(studentData.preferences || {});
        setError(null);
      } catch (error: any) {
        console.error("Error fetching booking:", error.message);
        setError("Failed to fetch booking details.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, fetchBooking);
    return () => unsubscribe();
  }, [router, id]);

  useEffect(() => {
    if (booking && newDate) {
      const fetchAvailability = async () => {
        const instructorDoc = await getDoc(doc(db, "users", booking.instructorId));
        const availability = instructorDoc.data()?.availability || [];
        const dateKey = newDate.toISOString().split("T")[0];
        const availableSlots = availability
          .filter((slot: any) => slot.date === dateKey)
          .map((slot: any) => `${slot.startTime}-${slot.endTime}`);
        setAvailableTimes(availableSlots);
      };
      fetchAvailability();
    }
  }, [booking, newDate]);

  const updateBooking = async (updates: Partial<Booking>) => {
    if (!booking || !auth.currentUser) return;

    const updatedBooking = { ...booking, ...updates };
    setBooking(updatedBooking);

    const [studentId] = (id as string).split("-");
    const instructorRef = doc(db, "users", booking.instructorId);
    const instructorSnap = await getDoc(instructorRef);
    const instructorData = instructorSnap.data();
    const instructorBookings = instructorData?.bookings || [];
    const instructorBookingIndex = instructorBookings.findIndex(
      (b: any) => b.studentId === studentId && timestampToString(b.createdAt) === booking.createdAt
    );

    if (instructorBookingIndex !== -1) {
        instructorBookings[instructorBookingIndex] = {
          ...instructorBookings[instructorBookingIndex],
          ...updates,
          createdAt: toDate(updatedBooking.createdAt),
          studentEmail: updatedBooking.studentEmail,
          studentId: updatedBooking.studentId,
          instructorId: updatedBooking.instructorId,
        };
      await updateDoc(instructorRef, { bookings: instructorBookings });
    }

    const studentRef = doc(db, "users", studentId);
    const studentSnap = await getDoc(studentRef);
    const studentData = studentSnap.data();
    const studentBookings = studentData?.bookings || [];
    const studentBookingIndex = studentBookings.findIndex(
      (b: any) => timestampToString(b.createdAt) === booking.createdAt && b.instructorId === booking.instructorId
    );

    if (studentBookingIndex !== -1) {
      studentBookings[studentBookingIndex] = {
        ...studentBookings[studentBookingIndex],
        ...updates,
        createdAt: toDate(updatedBooking.createdAt),
        studentEmail: updatedBooking.studentEmail,
        studentId: updatedBooking.studentId,
        instructorId: updatedBooking.instructorId,
      };
      await updateDoc(studentRef, { bookings: studentBookings });
    }

    await updateDoc(studentRef, {
      notifications: [
        ...(studentData?.notifications || []),
        {
          id: Date.now().toString(),
          type: "booking_update",
          message: `Your ${booking.lessonType} lesson on ${updatedBooking.date} at ${updatedBooking.time} has been updated by ${auth.currentUser.displayName || "your instructor"}`,
          read: false,
          redirectPath: `/student/lessons/${id}`,
        },
      ],
    });
  };

  const handleStatusChange = (status: Booking["status"]) => updateBooking({ status });
  const handlePaymentStatusChange = (paymentStatus: Booking["paymentStatus"]) =>
    updateBooking({ paymentStatus });
  const handleNotesSave = () => updateBooking({ notes });

  const handleReschedule = async () => {
    if (!booking || !newDate || !newTime) return;

    const dateKey = newDate.toISOString().split("T")[0];
    const [startTime] = newTime.split("-");
    await updateBooking({ date: dateKey, time: startTime, status: "pending" });

    const instructorRef = doc(db, "users", booking.instructorId);
    const instructorSnap = await getDoc(instructorRef);
    const availability = instructorSnap.data()?.availability || [];
    const newAvailability = availability.filter(
      (slot: any) => !(slot.date === dateKey && slot.startTime === startTime)
    );
    await updateDoc(instructorRef, { availability: newAvailability });

    setNewDate(null);
    setNewTime("");
  };

  const handleOpenChat = async () => {
    const user = auth.currentUser;
    if (!user || !booking) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("bookingId", "==", booking.id),
      where("instructorId", "==", user.uid),
      where("studentId", "==", booking.studentId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    if (messagesSnapshot.empty) {
      const newMessage = {
        studentId: booking.studentId,
        instructorId: user.uid,
        bookingId: booking.id,
        conversation: [
          {
            senderId: user.uid,
            senderName: user.displayName || "Instructor",
            text: `Starting conversation for your ${booking.lessonType} lesson on ${booking.date} at ${booking.time}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      const messageRef = await addDoc(collection(db, "messages"), newMessage);
      router.push(`/instructor/messages/${messageRef.id}`);
    } else {
      const messageId = messagesSnapshot.docs[0].id;
      router.push(`/instructor/messages/${messageId}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error || !booking) return <div className="flex items-center justify-center min-h-screen">{error || "Booking not found."}</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Booking Details</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Booking Information</h2>
              <p><strong>Student:</strong> {booking.studentName}</p>
              <p><strong>Email:</strong> {booking.studentEmail}</p>
              <p><strong>Lesson:</strong> {booking.lessonType}</p>
              <p><strong>Date:</strong> {booking.date}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Status:</strong> {booking.status}</p>
              <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
              <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
            </div>
            {studentPreferences && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Student Preferences</h2>
                <p><strong>Age:</strong> {studentPreferences.age || "N/A"}</p>
                <p><strong>Experience:</strong> {studentPreferences.experienceLevel || "N/A"}</p>
                <p><strong>Gender:</strong> {studentPreferences.gender || "N/A"}</p>
                <p><strong>Instructor Gender:</strong> {studentPreferences.instructorGender || "N/A"}</p>
                <p><strong>Language:</strong> {studentPreferences.languagePreference || "N/A"}</p>
                <p><strong>Requirements:</strong> {studentPreferences.specialRequirements || "None"}</p>
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Update Status</h2>
              <div className="flex space-x-2 flex-wrap gap-2">
                {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as Booking["status"])}
                    className={`px-3 py-1 rounded ${
                      booking.status === status
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Payment Actions</h2>
              <div className="flex space-x-2 flex-wrap gap-2">
                {["pending", "paid", "requested"].map((paymentStatus) => (
                  <button
                    key={paymentStatus}
                    onClick={() => handlePaymentStatusChange(paymentStatus as Booking["paymentStatus"])}
                    className={`px-3 py-1 rounded ${
                      booking.paymentStatus === paymentStatus
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this booking..."
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                rows={4}
              />
              <button
                onClick={handleNotesSave}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Notes
              </button>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Reschedule Booking</h2>
              <Calendar
                onChange={(value) => {
                const selectedDate = Array.isArray(value) ? value[0] : value;
                 setNewDate(selectedDate instanceof Date ? selectedDate : null);
                 }}
                 value={newDate || new Date(booking.date)}
                  className="mb-2"
                />
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a new time</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <button
                onClick={handleReschedule}
                disabled={!newDate || !newTime}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Chat with Student</h2>
              <button
                onClick={handleOpenChat}
                className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Open Chat
              </button>
            </div>
            <button
              onClick={() => router.push("/instructor/bookings")}
              className="w-full py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Bookings
            </button>
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