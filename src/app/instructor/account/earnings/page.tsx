"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function Earnings() {
  const router = useRouter();
  const [earnings, setEarnings] = useState({ weekly: 0, monthly: 0, allTime: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEarnings(data.earnings || { weekly: 0, monthly: 0, allTime: 0 });
        setHistory(data.paymentHistory || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleExport = () => {
    const csv = ["Date,Amount,Description", ...history.map((h) => `${h.date},${h.amount},${h.description}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "earnings_history.csv";
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Earnings</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <p>Weekly: ${earnings.weekly}</p>
              <p>Monthly: ${earnings.monthly}</p>
              <p>All-Time: ${earnings.allTime}</p>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment History</h2>
            {history.length === 0 ? (
              <p>No payment history yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((entry, index) => (
                  <li key={index} className="p-2 bg-gray-100 rounded">
                    {entry.date} - ${entry.amount} - {entry.description}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={handleExport}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Export History
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}