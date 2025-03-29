"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function ConfirmBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from query params
  const instructorId = searchParams.get("instructorId") || ""; 
  const instructorName = searchParams.get("instructorName") || "Instructor";
  const courseType = searchParams.get("courseType") || "N/A";
  const basePriceString = searchParams.get("price") || "0";
  const basePrice = parseFloat(basePriceString);

  // If you also pass date/time, read them here:
  // const lessonDate = searchParams.get("date") || "2025-03-26";
  // const lessonTime = searchParams.get("time") || "13:00";

  // 13% tax
  const taxRate = 0.13;
  const taxAmount = basePrice * taxRate;
  const totalPrice = basePrice + taxAmount;

  // Add Card states
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState("");

  // For success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // We'll store the student's doc ID here after we find it by email
  const [studentDocId, setStudentDocId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to find the student's doc by their email, if they're logged in
    const user = auth.currentUser;
    if (user && user.email) {
      findStudentDocIdByEmail(user.email)
        .then((docId) => {
          setStudentDocId(docId);
        })
        .catch((err) => {
          console.error("Error finding student doc by email:", err);
        });
    }
  }, []);

  /**
   * Finds the student's doc ID by matching the user's email in Firestore.
   * Returns the doc ID or null if not found.
   */
  const findStudentDocIdByEmail = async (email: string): Promise<string | null> => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      // We assume the first doc is the student's doc
      return snap.docs[0].id;
    }
    return null;
  };

  // Basic card validation
  const validateCard = () => {
    if (!cardNumber || cardNumber.length < 12) {
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

  // Book button
  const handleBook = async () => {
    // If "Add Card" is open, validate
    if (showAddCard) {
      const err = validateCard();
      if (err) {
        setCardError(err);
        return;
      }
    }

    // Ensure user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in as a student to book.");
      return;
    }

    // Make sure we have the student's doc ID
    if (!studentDocId) {
      alert("Could not find your student profile in Firestore.");
      return;
    }

    // Build a booking object
    // We can't use serverTimestamp() in arrayUnion, so use new Date()
    const bookingData = {
      instructorName,
      courseType,
      basePrice,
      taxAmount,
      totalPrice,
      // date: lessonDate,
      // time: lessonTime,
      createdAt: new Date(), // client-side date
      studentEmail: user.email,
    };

    try {
      // 1) Update the instructor doc if we have a valid instructorId
      if (instructorId) {
        await updateDoc(doc(db, "users", instructorId), {
          bookings: arrayUnion({
            ...bookingData,
            studentId: studentDocId, // link to the student's doc ID
          }),
        });
      }

      // 2) Update the student doc
      await updateDoc(doc(db, "users", studentDocId), {
        bookings: arrayUnion({
          ...bookingData,
          instructorId,
        }),
      });

      // Show success popup
      setShowSuccessPopup(true);

      // After 3 seconds, redirect to the student dashboard
      setTimeout(() => {
        router.push("/student");
      }, 3000);
    } catch (err) {
      console.error("Error saving booking:", err);
      alert("Failed to save booking. Please try again.");
    }
  };

  // Optional "Back" button
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-50 relative">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">{instructorName}</h1>

      {/* Course Info */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Course Info</h2>
        <p className="text-gray-700">Selected Course: {courseType}</p>
        <p className="text-gray-700">Base Price: ${basePrice.toFixed(2)}</p>
      </div>

      {/* Price Breakdown */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Price Breakdown</h2>
        <p className="text-gray-700">Base Price: ${basePrice.toFixed(2)}</p>
        <p className="text-gray-700">Tax (13%): ${taxAmount.toFixed(2)}</p>
        <hr className="my-2" />
        <p className="font-bold text-gray-900">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Payment Methods */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Pay with</h2>
        <div className="flex space-x-4">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
            Google Pay
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
            Apple Pay
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
            PayPal
          </button>
        </div>
      </div>

      {/* Add Card */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Add Card</h2>
        {!showAddCard ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Card
          </button>
        ) : (
          <div className="mt-2 p-4 border rounded shadow-inner bg-gray-100 transition-all">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                placeholder="xxxx xxxx xxxx xxxx"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-2">
              <div className="mb-3 flex-1">
                <label className="block text-sm font-medium mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-3 flex-1">
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input
                  type="text"
                  placeholder="CVC"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            {cardError && (
              <p className="text-red-500 text-sm mb-2">{cardError}</p>
            )}
          </div>
        )}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBook}
        className="mt-4 bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700 transition"
      >
        Book
      </button>

      {/* Optional: Back Button */}
      <button
        onClick={handleBack}
        className="mt-2 text-gray-600 hover:underline"
      >
        Back
      </button>

      {/* SUCCESS POPUP OVERLAY */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-yellow-100 p-6 rounded shadow-md max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
            <p className="text-gray-700 mb-4">
              We have successfully booked your lesson with {instructorName}.
              <br />
              Taking you to the dashboard now...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}