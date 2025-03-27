"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function EarningsDetailsPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState({ weekly: 0, monthly: 0, allTime: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEarnings(docSnap.data().earnings || { weekly: 500, monthly: 2000, allTime: 15000, pending: 100 });
      }
      setLoading(false);
    };
    fetchEarnings();
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Earnings Details</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Detailed Breakdown</h2>
            <div className="space-y-4">
              <p>Weekly Earnings: ${earnings.weekly}</p>
              <p>Monthly Earnings: ${earnings.monthly}</p>
              <p>All-Time Deposits: ${earnings.allTime}</p>
              <p>Pending Payments: ${earnings.pending}</p>
              <button
                onClick={() => router.push("/instructor/earnings-details/history")}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View Full History
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}