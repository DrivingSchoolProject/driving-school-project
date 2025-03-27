"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function AddLesson() {
  const router = useRouter();
  const [formData, setFormData] = useState({ type: "", price: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) return;

    if (!formData.type || !formData.price) {
      setError("All fields are required.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const existingLessons = docSnap.data()?.lessons || [];
      const newLesson = {
        id: Date.now().toString(),
        type: formData.type,
        price: parseFloat(formData.price),
      };
      await updateDoc(docRef, { lessons: [...existingLessons, newLesson] });
      router.push("/instructor/account/lesson-prices");
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
          <h1 className="text-3xl font-bold mb-6 text-center">Add New Lesson</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Lesson Type (e.g., Refresher Course)"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              list="lessonTypes"
            />
            <datalist id="lessonTypes">
              <option value="Refresher Course" />
              <option value="New Driver Lesson" />
              <option value="Advanced Maneuvers" />
            </datalist>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price ($)"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
            />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Add Lesson
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}