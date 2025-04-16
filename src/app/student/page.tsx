"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import Footer from "@/components/Footer"; // Using your Footer component
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Slider from "react-slick";
import {
  BellIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Define our instructor interface (for Best Instructor Matches slider)
export interface InstructorData {
  id: string;
  fullName: string;
  profilePic?: string;
  bestReview?: string;
  availability?: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

// Firestore data converter (optional but helps with TypeScript)
const instructorConverter: FirestoreDataConverter<InstructorData> = {
  toFirestore(instructor: InstructorData) {
    return {
      fullName: instructor.fullName,
      profilePic: instructor.profilePic,
      bestReview: instructor.bestReview,
      availability: instructor.availability,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): InstructorData {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      fullName: data.fullName,
      profilePic: data.profilePic,
      bestReview: data.bestReview,
      availability: data.availability,
    };
  },
};

export default function StudentDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // For Best Instructor Matches slider
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // Active tab: "preferences", "reservation", "messages", "bookings"
  const [activeTab, setActiveTab] = useState("reservation");

  // Booking states for date and time (for Book a Lesson tab)
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Fetch student data on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      // Fetch the student data from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        router.push("/login");
        return;
      }
      const data = docSnap.data();
      if (data.role !== "student") {
        router.push("/login");
        return;
      }
      setUserData(data);

      // For the Best Instructor Matches slider – fetch instructors data
      const instructorsRef = collection(db, "users").withConverter(instructorConverter);
      const instructorsQuery = query(
        instructorsRef,
        where("role", "==", "instructor"),
        where("approved", "==", true)
      );
      const instructorsSnap = await getDocs(instructorsQuery);
      const instructorList: InstructorData[] = instructorsSnap.docs.map((doc) => doc.data());
      setInstructors(instructorList);

      // Set bookings from the student's document (assumed to be stored as an array)
      setBookings(data.bookings || []);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Slider settings for Best Instructor Matches
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const prefs = userData?.preferences || {};

  // "Find Available Instructors" function for Book a Lesson
  const handleFindInstructors = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and time.");
      return;
    }
    router.push(`/instructor-list?date=${selectedDate}&time=${selectedTime}`);
  };

  // Helper: Render Upcoming Booking if a confirmed booking exists, else render Best Instructor Matches slider.
  const renderBookingOrSlider = () => {
    const now = new Date();
    // Filter bookings for those with bookingDateTime defined and status confirmed
    const upcomingBookings = bookings.filter((booking) => {
      if (!booking.bookingDateTime) return false;
      const bookingDate = booking.bookingDateTime?.toDate
        ? booking.bookingDateTime.toDate()
        : new Date(booking.bookingDateTime);
      return booking.status === "confirmed" && bookingDate > now;
    });

    if (upcomingBookings.length > 0) {
      // Sort upcoming bookings by date ascending (nearest first)
      upcomingBookings.sort((a, b) => {
        const aDate = a.bookingDateTime?.toDate ? a.bookingDateTime.toDate() : new Date(a.bookingDateTime);
        const bDate = b.bookingDateTime?.toDate ? b.bookingDateTime.toDate() : new Date(b.bookingDateTime);
        return aDate.getTime() - bDate.getTime();
      });
      const nearest = upcomingBookings[0];
      const bookingDate = nearest.bookingDateTime?.toDate
        ? nearest.bookingDateTime.toDate()
        : new Date(nearest.bookingDateTime);
      return (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">📅 Upcoming Booking</h2>
          <div className="p-4 bg-blue-100 rounded shadow">
            <p>
              <strong>Booking Time:</strong> {bookingDate.toLocaleString()}
            </p>
            <p>
              <strong>Instructor:</strong> {nearest.instructorName}
            </p>
            <p>
              <strong>Course Type:</strong> {nearest.courseType}
            </p>
            <p>
              <strong>Total Price:</strong> ${nearest.totalPrice}
            </p>
          </div>
        </section>
      );
    } else {
      return (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🚗 Best Instructor Matches</h2>
          <Slider {...sliderSettings}>
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <img
                  src={instructor.profilePic || "/default-avatar.png"}
                  alt={instructor.fullName}
                  className="w-16 h-16 mx-auto rounded-full object-cover"
                />
                <h3 className="font-bold mt-2">{instructor.fullName}</h3>
                <p className="text-yellow-500">⭐⭐⭐⭐⭐</p>
                <p className="text-gray-500 text-sm mt-1">
                  {instructor.bestReview || "Great Instructor!"}
                </p>
              </div>
            ))}
          </Slider>
        </section>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="font-sans min-h-screen flex flex-col bg-green-50 relative">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <BellIcon className="w-6 h-6 text-white cursor-pointer" />
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
          <UserCircleIcon
            className="w-8 h-8 text-white cursor-pointer"
            onClick={() => router.push("/student/profile")}
          />
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-green-50 pt-24 px-4 pb-16">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Welcome {userData?.firstName || "Student"}
          </h1>

          {/* Render Upcoming Booking (if confirmed and upcoming) or Best Instructor Matches */}
          {renderBookingOrSlider()}

          {/* TAB NAVIGATION */}
          <section className="mb-8">
            <div className="flex w-full border-b border-gray-300 text-lg">
             
              <button
                onClick={() => setActiveTab("reservation")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "reservation"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Book a Lesson
              </button>
              <button
   onClick={() => setActiveTab("messages")}
   className={`flex-1 text-center py-3 focus:outline-none ${
     activeTab === "messages"
       ? "border-b-4 border-green-600 text-green-700 font-semibold"
       : "text-gray-600 hover:bg-green-100 transition-colors"
   }`}
 >
   Messages
 </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "bookings"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "preferences"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Manage Preferences
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-4 bg-white rounded shadow mt-2">

            {activeTab === "reservation" && (
                <div>
                  <h3 className="font-semibold mb-4">Select Date/Time</h3>
                  <div className="flex flex-col space-y-4">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                      placeholder="Select Date"
                    />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                      placeholder="Select Time"
                    />
                    <button
                      onClick={handleFindInstructors}
                      className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      Find Available Instructors
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-800">
                    Your Current Preferences
                  </h3>
                  {/* Card-like container */}
                  <div className="p-4 bg-gray-50 rounded shadow">
                    <div className="space-y-2 text-gray-700 text-sm">
                      <p>
                        <strong>Age:</strong> {prefs.age || "N/A"}
                      </p>
                      <p>
                        <strong>Gender:</strong> {prefs.gender || "N/A"}
                      </p>
                      <p>
                        <strong>Vehicle Preference:</strong> {prefs.vehiclePreference || "N/A"}
                      </p>
                      <p>
                        <strong>Language Preference:</strong> {prefs.languagePreference || "N/A"}
                      </p>
                      <p>
                        <strong>Instructor Gender:</strong> {prefs.instructorGender || "N/A"}
                      </p>
                      <p>
                        <strong>Experience Level:</strong> {prefs.experienceLevel || "N/A"}
                      </p>
                      <p>
                        <strong>Special Requirements:</strong> {prefs.specialRequirements || "N/A"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => router.push("/preferences")}
                        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-600"
                      >
                        Update Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              

{activeTab === "messages" && (
   <div>
     <h3 className="font-semibold mb-2">Messages</h3>
     <p className="text-gray-700">No messages available at this time.</p>
   </div>
 )}

              {activeTab === "bookings" && (
                <div>
                  <h3 className="font-semibold mb-4">My Bookings</h3>
                  {bookings.length === 0 ? (
                    <p className="text-gray-700">No bookings yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {bookings.map((booking, index) => {
                        const bookingDate =
                          booking.bookingDateTime && booking.bookingDateTime.toDate
                            ? booking.bookingDateTime.toDate()
                            : new Date(booking.bookingDateTime);
                        return (
                          <li key={index} className="border rounded p-2">
                            <p>
                              <strong>Instructor:</strong> {booking.instructorName}
                            </p>
                            <p>
                              <strong>Booking Time:</strong> {bookingDate.toLocaleString()}
                            </p>
                            <p>
                              <strong>Course Type:</strong> {booking.courseType}
                            </p>
                            <p>
                              <strong>Total Price:</strong> {booking.totalPrice}
                            </p>
                            <p>
                              <strong>Booking Status:</strong> {booking.status}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />

        {/* FLOATING CHAT BUTTON */}
        <div
          className="fixed bottom-24 right-6 bg-green-600 p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-700 transition-transform transform hover:scale-110 z-50"
          onClick={() => setChatOpen(true)}
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-white" />
        </div>

        {/* CHAT BOX */}
        {chatOpen && (
          <div className="fixed bottom-32 right-6 w-80 h-96 bg-white shadow-lg rounded-lg flex flex-col p-4 animate-fade-in z-50">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold">Driving School Bot</h3>
              <XMarkIcon
                className="w-6 h-6 text-gray-600 cursor-pointer"
                onClick={() => setChatOpen(false)}
              />
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-500">
              How can I help you?
            </div>
            <input
              type="text"
              className="w-full border rounded p-2 mt-2"
              placeholder="Type a message..."
            />
          </div>
        )}

        {/* SUCCESS POPUP */}
        {showSuccessPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-yellow-100 p-6 rounded shadow-md max-w-sm text-center">
              <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
              <p className="text-gray-700 mb-4">
                We have successfully booked your lesson.
                <br />
                Taking you to the dashboard now...
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}