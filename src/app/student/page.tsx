"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Import the protection component

export default function StudentDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login"); // Redirect if not logged in
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        router.push("/login");
        return;
      }

      const userData = docSnap.data();
      if (userData.role !== "student") {
        router.push("/login"); // Redirect unauthorized users
        return;
      }

      setUserData(userData);

      // Fetch recommended instructors
      const instructorsQuery = query(collection(db, "users"), where("role", "==", "instructor"), where("approved", "==", true));
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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}> {/* ✅ Protecting the route */}
      <div className="font-sans min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gray-100 pt-24 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Welcome, {userData?.fullName || "Student"}
          </h1>

          {/* Best Instructor Matches */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">🚗 Best Instructor Matches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {instructors.length > 0 ? (
                instructors.map((instructor) => (
                  <div key={instructor.id} className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
                    <img src={instructor.profilePic || "/default-avatar.png"} alt={instructor.fullName} className="w-16 h-16 mx-auto rounded-full object-cover" />
                    <h3 className="font-bold mt-2 text-center">{instructor.fullName}</h3>
                    <p className="text-center text-yellow-500">⭐⭐⭐⭐⭐</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No instructors available</p>
              )}
            </div>
          </section>

          {/* Update Preferences */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">⚙️ Update Preferences</h2>
            <p className="mb-2">Review and update your learning preferences anytime.</p>
            <Link href="/preferences">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                Update Preferences
              </button>
            </Link>
          </section>

          {/* Book a Lesson */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">📅 Book a Lesson</h2>
            <p className="mb-2">Find an instructor and schedule your next lesson.</p>
            <Link href="/book-lesson">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Book Now
              </button>
            </Link>
          </section>

          {/* Chat with Instructors */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">💬 Chat with Instructors</h2>
            <p className="mb-2">Connect with instructors via our in-app chat.</p>
            <Link href="/chat">
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                Open Chat
              </button>
            </Link>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-green-900 text-white py-8 px-6 mt-auto">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold">Driving School</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {["Features", "Pricing", "FAQ", "Privacy Policy", "Terms of Service"].map((link, index) => (
                <a key={index} href="#" className="hover:text-white transition">
                  {link}
                </a>
              ))}
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
    </ProtectedRoute>
  );
}
