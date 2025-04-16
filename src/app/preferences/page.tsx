"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute"; // Or your route protection

export default function PreferencesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    vehiclePreference: "",
    languagePreference: "",
    instructorGender: "",
    experienceLevel: "",
    specialRequirements: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists() || userDocSnap.data().role !== "student") {
        router.push("/login");
        return;
      }

      const userData = userDocSnap.data();
      setFormData({
        age: userData.preferences?.age || "",
        gender: userData.preferences?.gender || "",
        vehiclePreference: userData.preferences?.vehiclePreference || "",
        languagePreference: userData.preferences?.languagePreference || "",
        instructorGender: userData.preferences?.instructorGender || "",
        experienceLevel: userData.preferences?.experienceLevel || "",
        specialRequirements: userData.preferences?.specialRequirements || "",
      });

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  // Update form state on input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      // Update the user's preferences in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { preferences: formData });

      // Redirect to the student dashboard
      router.push("/student");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="font-sans min-h-screen flex flex-col bg-green-50">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
        </header>

        {/* MAIN CONTENT: PREFERENCES FORM */}
        <main className="flex-1 flex flex-col items-center justify-center pt-24">
          <div className="w-full max-w-lg mx-auto bg-green-100 p-8 shadow-md rounded-lg mt-12 mb-12">
            <h1 className="text-3xl font-bold mb-6 text-center text-black">
              Student Preferences
            </h1>
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="block mb-1 font-semibold">Age</label>
    <input
      type="number"
      name="age"
      value={formData.age}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
      placeholder="Your age"
    />
  </div>

  <div>
    <label className="block mb-1 font-semibold">Gender</label>
    <select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>

  <div>
    <label className="block mb-1 font-semibold">Vehicle Preference</label>
    <select
      name="vehiclePreference"
      value={formData.vehiclePreference}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
      
      >
        <option value="">Select Vehicle Type</option>
      <option value="Sedan">Sedan</option>
      <option value="Hatchback">Hatchback</option>
      <option value="SUV">SUV</option>
    </select>
  </div>

  <div>
    <label className="block mb-1 font-semibold">Language Preference</label>
    <input
      type="text"
      name="languagePreference"
      value={formData.languagePreference}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
      placeholder="e.g., English, Spanish"
    />
  </div>

  <div>
    <label className="block mb-1 font-semibold">Instructor Gender Preference</label>
    <select
      name="instructorGender"
      value={formData.instructorGender}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
    >
      <option value="">No Preference</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
  </div>

  <div>
    <label className="block mb-1 font-semibold">Experience Level</label>
    <select
      name="experienceLevel"
      value={formData.experienceLevel}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
    >
      <option value="">Select Level</option>
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </select>
  </div>

  <div>
    <label className="block mb-1 font-semibold">Special Requirements</label>
    <textarea
      name="specialRequirements"
      value={formData.specialRequirements}
      onChange={handleChange}
      rows={4}
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:shadow-md"
      placeholder="Any special requirements?"
    />
  </div>

  <button
    type="submit"
    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform"
  >
    Save Preferences
  </button>
</form>
          </div>
        </main>

        {/* FOOTER (Same as page.tsx) */}
        <footer className="bg-green-900 text-white py-8 px-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold">Driving School</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {["Features", "Pricing", "FAQ", "Privacy Policy", "Terms of Service"].map(
                (link, index) => (
                  <a key={index} href="#" className="hover:text-white transition">
                    {link}
                  </a>
                )
              )}
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