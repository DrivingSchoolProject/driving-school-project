"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function Reviews() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
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
        setReviews(docSnap.data().reviews || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const renderStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Reviews</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review, index) => (
                  <li key={index} className="p-4 bg-gray-100 rounded">
                    <p className="text-yellow-500">{renderStars(review.rating)}</p>
                    <p>{review.studentName} - {review.comment}</p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                    <button className="mt-2 text-blue-600 underline">Reply</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}