"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
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

// If you have a ReservationDetails component/page, import it:
import ReservationDetails from "@/app/ReservationDetails/page";

export default function StudentDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  // Active tab: "preferences", "reservation", "notifications"
  const [activeTab, setActiveTab] = useState("preferences");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

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

      // Fetch instructors
      const instructorsQuery = query(
        collection(db, "users"),
        where("role", "==", "instructor"),
        where("approved", "==", true)
      );
      const instructorsSnap = await getDocs(instructorsQuery);
      const instructorList = instructorsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setInstructors(instructorList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Slider settings for the instructor slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,         // 1 second transition
    autoplay: true,
    autoplaySpeed: 4000, // 4 seconds per slide
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

  // Safely read the user's preferences
  const prefs = userData?.preferences || {};

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="font-sans min-h-screen flex flex-col bg-green-50 relative">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <BellIcon className="w-6 h-6 text-white cursor-pointer" />
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
          <UserCircleIcon className="w-8 h-8 text-white cursor-pointer" />
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-green-50 pt-24 px-4 pb-16">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Welcome, {userData?.fullName || "Student"}
          </h1>

          {/* BEST INSTRUCTOR MATCHES */}
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

          {/* TAB NAVIGATION (FULL WIDTH) */}
          <section className="mb-8">
            {/* Full-width tab row */}
            <div className="flex w-full border-b border-gray-300 text-lg">
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
                onClick={() => setActiveTab("notifications")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "notifications"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Notifications
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4 bg-white rounded shadow mt-2">
              {activeTab === "preferences" && (
                <div>
                  <h3 className="font-semibold mb-2">Current Preferences</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Age: {prefs.age || "N/A"}</li>
                    <li>Gender: {prefs.gender || "N/A"}</li>
                    <li>
                      Vehicle Preference: {prefs.vehiclePreference || "N/A"}
                    </li>
                    <li>
                      Language Preference: {prefs.languagePreference || "N/A"}
                    </li>
                    <li>
                      Instructor Gender: {prefs.instructorGender || "N/A"}
                    </li>
                    <li>
                      Experience Level: {prefs.experienceLevel || "N/A"}
                    </li>
                    <li>
                      Special Requirements:{" "}
                      {prefs.specialRequirements || "N/A"}
                    </li>
                  </ul>
                  <button
                    onClick={() => router.push("/preferences")}
                    className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition-colors"
                  >
                    Update Preferences
                  </button>
                </div>
              )}

              {activeTab === "reservation" && (
                <div>
                  {/* If you have a ReservationDetails component */}
                  <ReservationDetails />
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <p className="text-gray-700">
                    No notifications available at this time.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-green-900 text-white py-8 px-6 mt-auto">
          <div className="container mx-auto text-center text-sm">
            © 2025 Driving School. All rights reserved.
          </div>
        </footer>

        {/* FLOATING CHAT BUTTON */}
        <div
          className="fixed bottom-24 right-6 bg-blue-600 p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-transform transform hover:scale-110 z-50"
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
      </div>
    </ProtectedRoute>
  );
}