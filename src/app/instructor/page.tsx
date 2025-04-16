"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Import useRouter
import { auth, db } from "@/library/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Route protection added

// interface InstructorDashboardProps {
//   user: { id: string }; // Assuming you get params from Next.js dynamic routes
// }

export default function InstructorDashboard() {
  const router = useRouter(); // ✅ Initialize router
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login"); // ✅ Redirect to login if not logged in
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      console.log(user.uid);

      if (!docSnap.exists() || docSnap.data().role !== "instructor") {
        router.push("/login"); // ✅ Redirect unauthorized users
        return;
      }

      setUserData(docSnap.data());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]); // ✅ Added current user UID to dependencies

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["instructor"]}> {/* ✅ Protecting the route */}
      <div className="font-sans min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gray-100 pt-24 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome, {userData?.fullName || "Instructor"}</h1>

          {/* <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">📅</h2>
            <p className="p-4 bg-white rounded shadow">No bookings available at the moment.</p>
          </section> */}

{userData.stage === "Upload" && (
  <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 text-center">
    <h2 className="text-2xl font-semibold mb-4">Congratulations!</h2>
    <p className="text-gray-700 mb-6">
      You have successfully passed the preliminary check. Please upload the documents below to complete your registration.
    </p>
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300"
      onClick={() =>
        router.push(`/instructor/${auth.currentUser?.uid}/document-upload`)
      }
    >
      Upload Your Documents
    </button>
  </div>
)}

{userData.stage === "L2 Form Submitted" && (
  <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 text-center">
    <h2 className="text-2xl font-semibold mb-4">Congratulations!</h2>
    <p className="text-gray-700 mb-6">
    Thank you for uploading the documents. Your application is under review. 
    </p>
  </div>
)}

{userData.stage === "accepted" && (
  <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 text-center">
    <h2 className="text-2xl font-semibold mb-4">Congratulations!</h2>
    <p className="text-gray-700 mb-6">
    Congratulations . You are ready to start teaching. 
    </p>
  </div>
)}



        </main>
      </div>
    </ProtectedRoute>
  );
}
