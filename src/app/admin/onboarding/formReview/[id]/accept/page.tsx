// pages/admin/onboarding/formReview/[id]/accept/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase"; // Your Firebase client config
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Adjust this interface to match your Firestore document fields
interface UserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  experience?: string; // e.g. "Tell us about your experience"
  stage?: string;      // e.g. onboarding stage/status
}

export default function AcceptPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the [id] parameter from the URL
  const { id } = useParams() as { id: string };
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        console.error("No user ID provided in the URL.");
        setLoading(false);
        return;
      }

      try {
        // Reference the user's document in Firestore
        const docRef = doc(db, "users", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          // Update state with fetched user data
          setUserData(snapshot.data() as UserData);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDashboardRedirect = async () => {
    if (!id) {
      console.error("No user ID provided in the URL.");
      return;
    }

    try {
      // Update the user stage to "accepted" in Firestore
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { stage: "accepted" });
      console.log("User accepted and stage updated to 'accepted'");

      // Redirect to the admin onboarding page
      router.push("/admin/onboarding");
    } catch (error) {
      console.error("Error updating user stage to 'accepted':", error);
    }
  };

  // Display a loading message while user data is being fetched
  if (loading) {
    return <div className="p-6">Loading user data...</div>;
  }

  // If no user was found in Firestore, display an error
  if (!userData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>No user exists with ID: {id}</p>
      </div>
    );
  }

  // Otherwise, display the user data and an action button
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Congratulations {userData.fullName}
      </h1>
      <p className="text-lg mb-6">
        You are successfully onboarded with us. Please update your personal
        dashboard to continue.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleDashboardRedirect}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Go to Admin Dashboard
        </button>
      </div>
    </div>
  );
}