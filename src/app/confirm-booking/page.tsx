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
  getDoc,
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

  // Calculate tax and total
  const taxRate = 0.13;
  const taxAmount = basePrice * taxRate;
  const totalPrice = basePrice + taxAmount;

  // Card form states
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState("");

  // Payment options state (to show add payment options)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // For success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Student document ID and saved payment methods
  const [studentDocId, setStudentDocId] = useState<string | null>(null);

  useEffect(() => {
    // Find the student's Firestore doc by email if logged in
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
   */
  const findStudentDocIdByEmail = async (email: string): Promise<string | null> => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }
    return null;
  };

  // Basic card validation
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

  // Save card details to Firestore
  const handleSaveCard = async () => {
    const err = validateCard();
    if (err) {
      setCardError(err);
      return;
    }
    if (!studentDocId) {
      alert("Student document not found.");
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
      // Clear card form and hide it
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardError("");
      setShowAddCard(false);
      setShowPaymentOptions(false);
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Failed to save card. Please try again.");
    }
  };

  // Book button handler (if add card is open, it saves card first)
  const handleBook = async () => {
    if (showAddCard) {
      const err = validateCard();
      if (err) {
        setCardError(err);
        return;
      }
      await handleSaveCard();
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in as a student to book.");
      return;
    }
    if (!studentDocId) {
      alert("Could not find your student profile in Firestore.");
      return;
    }

    const bookingData = {
      instructorName,
      courseType,
      basePrice,
      taxAmount,
      totalPrice,
      createdAt: new Date(),
      studentEmail: user.email,
    };

    try {
      // Update instructor document (if instructorId exists)
      if (instructorId) {
        await updateDoc(doc(db, "users", instructorId), {
          bookings: arrayUnion({
            ...bookingData,
            studentId: studentDocId,
          }),
        });
      }

      // Update student document
      await updateDoc(doc(db, "users", studentDocId), {
        bookings: arrayUnion({
          ...bookingData,
          instructorId,
        }),
      });

      // Show success popup and redirect after 3 seconds
      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push("/student");
      }, 3000);
    } catch (err) {
      console.error("Error saving booking:", err);
      alert("Failed to save booking. Please try again.");
    }
  };

  // Optional back button handler
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
        <p className="font-bold text-gray-900">Total: ${totalPrice.toFixed(2)}</p>
      </div>

      {/* Payment Methods Section */}
      <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
        {/* If no payment options are currently shown, display an "Add Payment Method" button */}
        {!showPaymentOptions && (
          <button
            onClick={() => setShowPaymentOptions(true)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Payment Method
          </button>
        )}
        {/* When options are shown, display them */}
        {showPaymentOptions && (
          <div className="mt-2 space-y-2">
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Add Card
            </button>
            <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
              Google Pay
            </button>
            <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
              Apple Pay
            </button>
            <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
              PayPal
            </button>
          </div>
        )}
        {/* If "Add Card" is chosen, show card details form */}
        {showAddCard && (
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
            {cardError && <p className="text-red-500 text-sm mb-2">{cardError}</p>}
            <button
              onClick={handleSaveCard}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Save Card
            </button>
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
      <button onClick={handleBack} className="mt-2 text-gray-600 hover:underline">
        Back
      </button>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-yellow-100 p-6 rounded shadow-md max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">Congratulations!</h3>
            <p className="text-gray-700 mb-4">
              We have successfully booked your lesson with {instructorName}.<br />
              Taking you to the dashboard now...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
