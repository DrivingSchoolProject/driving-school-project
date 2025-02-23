"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/library/firebase"; // Adjust path if needed
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Update form state on input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setLoginSuccess(true);
      // Optionally, clear form fields
      setFormData({ email: "", password: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="font-sans relative min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <div className="text-2xl font-bold text-white">
          <Link href="/">Driving School</Link>
        </div>
      </header>

      {/* MAIN CONTENT: LOGIN FORM */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-100 pt-24">
        <div
          className="w-full max-w-md mx-auto bg-green-100 p-8 shadow-md rounded-lg mt-12 mb-12 transform transition-transform hover:scale-105 hover:shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-black">
            Log In to Your Account
          </h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-4 p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-4 p-3 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
            >
              Log In
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => setShowSignupModal(true)}
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </main>

      {/* FOOTER */}
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

      {/* Login Success Popup */}
      {loginSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <p className="mb-4">Logged in successfully.</p>
            <button
              onClick={() => {
                setLoginSuccess(false);
                // Optionally, redirect after login success
                // router.push("/dashboard");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal Overlay */}
      {showSignupModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowSignupModal(false)}
        >
          <div
            className="relative bg-black p-8 rounded-lg shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-white">
              Choose
            </h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setShowSignupModal(false);
                  router.push("/signup");
                }}
                className="w-full py-4 bg-green-600 text-white rounded-md hover:bg-black text-xl"
              >
                Want to Learn
              </button>
              <button
                onClick={() => setShowSignupModal(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-md hover:bg-yellow-500 text-xl"
              >
                Want to Teach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
