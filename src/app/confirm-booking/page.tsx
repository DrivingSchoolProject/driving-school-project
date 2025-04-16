"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import Footer from "@/components/Footer"; // Import the new Footer component
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
import {
  BellIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function ConfirmBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from query params
  const instructorId = searchParams.get("instructorId") || "";
  const instructorName = searchParams.get("instructorName") || "Instructor";
  const courseType = searchParams.get("courseType") || "N/A";
  const basePriceString = searchParams.get("price") || "0";
  const basePrice = parseFloat(basePriceString);
  const dateTime = searchParams.get("dateTime");

  // Calculate tax and total
  const taxRate = 0.13;
  const taxAmount = basePrice * taxRate;
  const totalPrice = basePrice + taxAmount;

  // Student document ID
  const [studentDocId, setStudentDocId] = useState<string | null>(null);

  // Saved payment methods from Firestore
  const [existingCards, setExistingCards] = useState<any[]>([]);

  // Track whether a valid card is selected (existing or newly added)
  const [isCardSelected, setIsCardSelected] = useState(false);
  // If user selects an existing card, store it here
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Payment options state
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Card form states (for adding a new card)
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardError, setCardError] = useState("");

  // For success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // For chatbot
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    // If user is logged in, find the student's doc by email, then fetch saved cards
    const user = auth.currentUser;
    if (user && user.email) {
      findStudentDocIdByEmail(user.email)
        .then(async (docId) => {
          setStudentDocId(docId);
          if (docId) {
            // Fetch user doc to get existing paymentMethods
            const userDocSnap = await getDoc(doc(db, "users", docId));
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (Array.isArray(userData.paymentMethods)) {
                setExistingCards(userData.paymentMethods);
              }
            }
          }
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

  // Cancel function to close Add Card form and reset inputs
  const handleCancelCard = () => {
    setShowAddCard(false);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardError("");
    setIsCardSelected(false);
    setSelectedCard(null);
  };

  // Save new card details to Firestore
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
      // Clear card form
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardError("");
      // Hide the add card form
      setShowAddCard(false);
      setShowPaymentOptions(false);

      // Mark this newly added card as selected
      setSelectedCard(cardData);
      setIsCardSelected(true);

      // Also update local state so we can display the newly added card in the list
      setExistingCards((prev) => [...prev, cardData]);
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Failed to save card. Please try again.");
    }
  };

  // Book button handler
  const handleBook = async () => {
    // Instead of disabling the button, show a popup if no valid card is selected.
    if (!isCardSelected || !selectedCard) {
      alert("Please add a valid card to proceed.");
      return;
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
      bookingDateTime: dateTime ? new Date(dateTime) : null,
      createdAt: new Date(),
      studentEmail: user.email,
      status: "confirmed", // Default status
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <BellIcon className="w-6 h-6 text-white cursor-pointer" />
        <div className="text-2xl font-bold text-white">
          <Link href="/">Driving School</Link>
        </div>
        <UserCircleIcon
          className="w-8 h-8 text-white cursor-pointer"
          onClick={() => router.push("/student/profile")}
        />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-green-50 pt-24 px-4 pb-16">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6 text-center">{instructorName}</h1>

        {/* Course Info */}
        <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4 mx-auto transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">Course Info</h2>
          <p className="text-gray-700">Selected Course: {courseType}</p>
          <p className="text-gray-700">Base Price: ${basePrice.toFixed(2)}</p>
          <p className="text-gray-700">
            Booking Date and Time: {dateTime ? new Date(dateTime).toLocaleString() : "N/A"}
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4 mx-auto transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">Price Breakdown</h2>
          <p className="text-gray-700">Base Price: ${basePrice.toFixed(2)}</p>
          <p className="text-gray-700">Tax (13%): ${taxAmount.toFixed(2)}</p>
          <hr className="my-2" />
          <p className="font-bold text-gray-900">Total: ${totalPrice.toFixed(2)}</p>
        </div>

        {/* Payment Methods Section */}
        <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4 mx-auto transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">Payment Method</h2>

          {/* Display existing saved cards */}
          {existingCards.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Your Saved Cards:</p>
              <div className="space-y-2 mt-2">
                {existingCards.map((card, idx) => {
                  // Show only last 4 digits
                  const last4 = card.cardNumber.slice(-4);
                  return (
                    <label
                      key={idx}
                      className="flex items-center space-x-2 transition-transform hover:scale-105"
                    >
                      <CreditCardIcon className="w-6 h-6 text-gray-500" />
                      <input
                        type="radio"
                        name="savedCard"
                        onChange={() => {
                          setSelectedCard(card);
                          setIsCardSelected(true);
                        }}
                      />
                      <span className="text-gray-700">
                        **** **** **** {last4} (Exp: {card.cardExpiry})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* If no payment options are currently shown, display an "Add Payment Method" button */}
          {!showPaymentOptions && (
            <button
              onClick={() => setShowPaymentOptions(true)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-transform transform hover:scale-110"
            >
              Add Payment Method
            </button>
          )}

          {/* Payment Options */}
          {showPaymentOptions && (
            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  setShowAddCard(true);
                  // Unselect any existing card if user is adding a new one
                  setSelectedCard(null);
                  setIsCardSelected(false);
                }}
                className="w-full bg-green-200 text-green-700 px-4 py-2 rounded hover:bg-green-300 transition-transform transform hover:scale-105"
              >
                Add Card
              </button>
              {/* Other payment methods remain visible */}
              <button
                onClick={() => {
                  setSelectedCard(null);
                  setIsCardSelected(false);
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-transform transform hover:scale-105"
              >
                Google Pay
              </button>
              <button
                onClick={() => {
                  setSelectedCard(null);
                  setIsCardSelected(false);
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-transform transform hover:scale-105"
              >
                Apple Pay
              </button>
              <button
                onClick={() => {
                  setSelectedCard(null);
                  setIsCardSelected(false);
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-transform transform hover:scale-105"
              >
                PayPal
              </button>
            </div>
          )}

          {/* If "Add Card" is chosen, show card details form */}
          {showAddCard && (
            <div className="mt-3 p-4 border rounded shadow-inner bg-gray-100 transition-all">
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
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-transform transform hover:scale-105"
              >
                Save Card
              </button>
              {/* Cancel Button - Normal text positioned below Save Card */}
              <div className="mt-2 text-center">
                <button
                  onClick={handleCancelCard}
                  className="text-black-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Book Button - Centered & Bigger */}
        <div className="w-full max-w-md mx-auto flex justify-center">
          <button
            onClick={handleBook}
            className="mt-4 bg-green-600 text-white px-10 py-4 rounded font-semibold hover:bg-green-700 transition-transform transform hover:scale-105"
          >
            Book
          </button>
        </div>
      </main>

      <Footer /> {/* Replace inline footer with Footer component */}

      {/* FLOATING CHAT BUTTON */}
      <div
        className="fixed bottom-24 right-6 bg-green-600 p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-700 transition-transform transform hover:scale-110 z-50"
        onClick={() => setChatOpen(true)}
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-white" />
      </div>

      {/* CHAT BOX */}
      {chatOpen && (
        <div className="fixed bottom-32 right-6 w-80 h-96 bg-white shadow-lg rounded-lg flex flex-col p-4 animate-fade-in z-50">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold">Driving School Bot</h3>
            <XMarkIcon
              className="w-6 h-6 text-gray-600 cursor-pointer"
              onClick={() => setChatOpen(false)}
            />
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            How can I help you?
          </div>
          <input
            type="text"
            className="w-full border rounded p-2 mt-2"
            placeholder="Type a message..."
          />
        </div>
      )}

      {/* SUCCESS POPUP */}
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