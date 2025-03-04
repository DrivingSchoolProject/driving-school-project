"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: "student",
        approved: true, // Students are automatically approved
      });

      // Redirect to Preferences page
      router.push("/preferences");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="font-sans min-h-screen flex flex-col bg-green-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <div className="text-2xl font-bold text-white">
          <Link href="/">Driving School</Link>
        </div>
      </header>

      {/* MAIN CONTENT: SIGNUP FORM */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24">
        <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg mt-12 mb-12">
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
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
  );
}
