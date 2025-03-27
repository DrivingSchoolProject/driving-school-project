"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Lesson } from "@/types";

export default function LessonPrices() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setLessons(docSnap.data().lessons || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handlePriceChange = (id: string, newPrice: number) => {
    setLessons((prev) => prev.map((lesson) => (lesson.id === id ? { ...lesson, price: newPrice } : lesson)));
  };

  const handleDelete = (id: string) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
  };

  const handleSubmit = async () => {
    setError("");
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), { lessons });
      router.push("/instructor");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Set Lesson Prices</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            {lessons.length === 0 ? (
              <p>No lessons set yet.</p>
            ) : (
              <ul className="space-y-4">
                {lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between">
                    <span>{lesson.type}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={lesson.price}
                        onChange={(e) => handlePriceChange(lesson.id, parseFloat(e.target.value))}
                        className="w-20 p-2 border rounded"
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/instructor/account/add-lesson"
              className="block mt-4 text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add New Lesson
            </Link>
            <button
              onClick={handleSubmit}
              className="w-full mt-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}