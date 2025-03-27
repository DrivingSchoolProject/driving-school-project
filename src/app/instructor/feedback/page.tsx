"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, setDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await setDoc(doc(db, "feedback", `${user.uid}-${Date.now()}`), {
        instructorId: user.uid,
        feedback,
        timestamp: new Date().toISOString(),
      });
      setSuccess(true);
      setFeedback("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Submit Feedback</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {success && <p className="text-green-600 text-center mb-4">Feedback submitted successfully!</p>}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please provide your feedback here..."
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              rows={6}
              required
            />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={() => router.push("/instructor")}
              className="w-full py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}