/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UpdatePaymentPage() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [error, setError] = useState("");
  const [studentDocId, setStudentDocId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch the student document ID on mount
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
      setStudentDocId(user.uid);
    });
    return () => unsubscribe();
  }, [router]);

  // Basic card validation function
  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 12) {
      return "Invalid card number (min 12 digits).";
    }
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      return "Expiry must be in MM/YY format.";
    }
    if (!cardCvc || cardCvc.length < 3) {
      return "Invalid CVC (min 3 digits).";
    }
    return "";
  };

  // Handle form submission to update the payment method in Firestore
  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!studentDocId) {
      setError("Student document not found.");
      return;
    }
    const cardData = {
      type: "card",
      cardNumber,
      cardExpiry,
      cardCvc,
      addedAt: new Date(),
    };
    try {
      await updateDoc(doc(db, "users", studentDocId), {
        paymentMethods: arrayUnion(cardData),
      });
      // Show the success popup
      setShowSuccess(true);
      // After 3 seconds, redirect to the profile page
      setTimeout(() => {
        router.push("/student/profile");
      }, 3000);
    } catch (err: any) {
      console.error("Error updating payment method:", err);
      setError("Failed to update payment method. Please try again.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="min-h-screen bg-green-50 flex flex-col">
        {/* HEADER */}
        <header className="w-full p-6 bg-black bg-opacity-70 text-white">
          <h1 className="text-2xl font-bold">Update Payment Method</h1>
        </header>

        {/* MAIN FORM */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center mb-6">Add Card</h2>
            {error && (
              <p className="text-red-600 text-center mb-4">{error}</p>
            )}
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number (xxxx xxxx xxxx xxxx)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="cardExpiry"
                  placeholder="Expiry (MM/YY)"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="cardCvc"
                  placeholder="CVC"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
              >
                Add Payment Method
              </button>
            </form>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-green-900 text-white py-4 text-center">
          © 2025 Driving School. All rights reserved.
        </footer>

        {/* SUCCESS POPUP OVERLAY */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-yellow-100 p-6 rounded shadow-md max-w-sm text-center">
              <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
              <p className="text-gray-700">
                Your card has been successfully added.
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
