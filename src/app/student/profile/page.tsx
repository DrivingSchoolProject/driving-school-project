"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer"; // Imported new Footer component

import { BellIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Active tab: "info", "preferences", "payment", "history"
  const [activeTab, setActiveTab] = useState("info");

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
      if (data.role !== "student") {
        router.push("/login");
        return;
      }
      setUserData(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Destructure fields (adjust field names per your schema)
  const {
    firstName,
    lastName,
    dateOfBirth,
    age,
    gender,
    email,
    password,
    preferences,
    paymentMethods,
  } = userData || {};

  // Delete a card from Firestore and update local state
  const handleDeleteCard = async (cardToDelete: any) => {
    try {
      // Remove the card from Firestore document using arrayRemove
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          paymentMethods: arrayRemove(cardToDelete),
        });
        // Update local state: filter out the deleted card
        setUserData((prevData: any) => ({
          ...prevData,
          paymentMethods: prevData.paymentMethods.filter(
            (card: any) =>
              card.cardNumber !== cardToDelete.cardNumber ||
              card.cardExpiry !== cardToDelete.cardExpiry ||
              card.cardCvc !== cardToDelete.cardCvc
          ),
        }));
      }
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Failed to delete card. Please try again.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="font-sans min-h-screen flex flex-col bg-green-50 relative">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="flex items-center">
            <ArrowLeftIcon
              className="w-6 h-6 text-white cursor-pointer mr-4"
              onClick={() => router.push("/student")}
            />
            <BellIcon className="w-6 h-6 text-white cursor-pointer" />
          </div>
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="text-2xl font-bold text-white pointer-events-auto">
              <Link href="/">Driving School</Link>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-green-50 pt-24 px-4 pb-16">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Student Dashboard
          </h1>

          {/* TAB NAVIGATION */}
          <section>
            <div className="flex w-full border-b border-gray-300 text-lg mb-4">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "info"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Student Info
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "preferences"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "payment"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Payment Method
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 text-center py-3 focus:outline-none ${
                  activeTab === "history"
                    ? "border-b-4 border-green-600 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-green-100 transition-colors"
                }`}
              >
                Lesson History
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-4 bg-white rounded shadow">
              {activeTab === "info" && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Student Info</h2>
                  <p className="text-gray-700 mb-2">
                    <strong>First Name:</strong> {firstName || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Last Name:</strong> {lastName || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Date of Birth:</strong> {dateOfBirth || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Age:</strong> {age || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Gender:</strong> {gender || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> {email || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Password:</strong> {password ? "********" : "N/A"}
                  </p>
                  <button
                    onClick={() => router.push("/student/update-info")}
                    className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition-colors"
                  >
                    Update Student Info
                  </button>
                </div>
              )}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Preferences</h2>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Age: {preferences?.age || "N/A"}</li>
                    <li>Gender: {preferences?.gender || "N/A"}</li>
                    <li>
                      Vehicle Preference:{" "}
                      {preferences?.vehiclePreference || "N/A"}
                    </li>
                    <li>
                      Language Preference:{" "}
                      {preferences?.languagePreference || "N/A"}
                    </li>
                    <li>
                      Instructor Gender:{" "}
                      {preferences?.instructorGender || "N/A"}
                    </li>
                    <li>
                      Experience Level:{" "}
                      {preferences?.experienceLevel || "N/A"}
                    </li>
                    <li>
                      Special Requirements:{" "}
                      {preferences?.specialRequirements || "N/A"}
                    </li>
                  </ul>
                </div>
              )}
              {activeTab === "payment" && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Payment Method</h2>
                  {paymentMethods && paymentMethods.length > 0 ? (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1">
                        Saved Payment Methods:
                      </h3>
                      {paymentMethods.map((method: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded mb-2"
                        >
                          {method.type === "card" && (
                            <div>
                              <p className="text-sm">
                                Card: **** **** ****{" "}
                                {method.cardNumber.slice(-4)}
                              </p>
                              <p className="text-xs">
                                Exp: {method.cardExpiry}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteCard(method)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 mb-2">
                      No payment method added yet.
                    </p>
                  )}
                  <button
                    onClick={() => router.push("/student/update-payment")}
                    className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition-colors"
                  >
                    Add Payment Method
                  </button>
                </div>
              )}
              {activeTab === "history" && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Lesson History</h2>
                  <p className="text-gray-700">No lessons completed yet.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
