/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UpdateStudentInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // We'll store the student info in state
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    email: "",
  });

  // Fetch current student data from Firestore
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
      // Set student data (adjust field names as needed)
      setStudentData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        dateOfBirth: data.dateOfBirth || "",
        age: data.age || "",
        gender: data.gender || "",
        email: data.email || "",
      });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Handle changes in the form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission to update Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) {
      setError("You are not logged in.");
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dateOfBirth: studentData.dateOfBirth,
        age: studentData.age,
        gender: studentData.gender,
        email: studentData.email,
      });
      // Redirect back to the profile page
      router.push("/student/profile");
    } catch (err: any) {
      console.error("Error updating student info:", err);
      setError("Failed to update information. Please try again.");
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
      <div className="min-h-screen bg-green-50 flex flex-col">
        {/* HEADER */}
        <header className="w-full p-6 bg-black bg-opacity-70 text-white">
          <h1 className="text-2xl font-bold">Update Student Info</h1>
        </header>

        {/* MAIN FORM */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center mb-6">
              Update Your Information
            </h2>
            {error && (
              <p className="text-red-600 text-center mb-4">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={studentData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={studentData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={studentData.age}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="gender"
                placeholder="Gender"
                value={studentData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <input
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={studentData.dateOfBirth}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={studentData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
              >
                Update Info
              </button>
            </form>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-green-900 text-white py-4 text-center">
          © 2025 Driving School. All rights reserved.
        </footer>
      </div>
    </ProtectedRoute>
  );
}
