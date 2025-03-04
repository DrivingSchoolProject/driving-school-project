// app/instructorSignup/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase"; // Adjust path as needed
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function InstructorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    experience: "",
    licenseNumber: "",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Handle input changes for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle file selection for document upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate that passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Create a new instructor user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Initialize documentURL as an empty string
      let documentURL = "";

      // If a document file is selected, upload it to Firebase Storage
      if (documentFile) {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `documents/${userCredential.user.uid}/${documentFile.name}`
        );
        await uploadBytes(storageRef, documentFile);
        documentURL = await getDownloadURL(storageRef);
      }

      // Save instructor details in Firestore, including the document URL
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: "instructor",
        approved: false, // Instructor account pending admin approval
        experience: formData.experience,
        licenseNumber: formData.licenseNumber,
        documentURL, // URL of the uploaded document (if any)
      });

      // Sign the user out since they need admin approval before logging in
      await signOut(auth);

      // Redirect to the pending approval page
      router.push("/pendingApproval");
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

      {/* MAIN CONTENT: INSTRUCTOR SIGNUP FORM */}
      <main className="flex-1 flex items-center justify-center bg-gray-100 pt-24">
        <div className="w-full max-w-md mx-auto bg-blue-100 p-8 shadow-lg rounded-lg mt-12 mb-12 transform transition-transform hover:scale-105">
          <h1 className="text-3xl font-bold mb-4 text-center text-black">Instructor Signup</h1>
          <p className="text-center mb-6 text-black">
            Please fill in your details. Your account will be reviewed by an admin before you can log in.
          </p>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
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
            <input
              type="text"
              name="experience"
              placeholder="Teaching Experience (years)"
              value={formData.experience}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="licenseNumber"
              placeholder="Driver License Number"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            {/* Document Upload Block */}
            <div>
              <label className="block mb-1 font-semibold">Upload Documents</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
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
    </div>
  );
}
