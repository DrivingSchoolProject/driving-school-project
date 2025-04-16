// pages/admin/onboarding/formReview/[id]/accept/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase"; // Your Firebase client config
import { doc, updateDoc, getDoc } from "firebase/firestore";

// Adjust this interface to match your Firestore document fields
interface UserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  experience?: string; // e.g. "Tell us about your experience"
}

export default function AcceptPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams(); // grabs the [id] from the URL
  const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (!params?.id) return;

            try {
                const docRef = doc(db, "users", params.id);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
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
    }, [params.id]);

  const handleDashboardRedirect = () => {
    // Update the user stage to "Accepted"
    if (params?.id) {
      const userRef = doc(db, "users", params.id);

      updateDoc(userRef, {
        stage: "accepted", // Set stage to "accepted"
      }).then(() => {
        console.log("User accepted and stage updated to 'Accepted'");
        // Redirect to admin dashboard
        router.push("/admin/onboarding");
      }).catch((error) => {
        console.error("Error updating user stage to 'Accepted':", error);
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading user data...</div>;
  }

  if (!userData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>No user exists with ID: {params.id}</p>
      </div>
    );
  }

  // Combine fullName + lastName for "Full Name"
  const fullName = `${userData.fullName || ""}`.trim();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Congratulations {fullName}</h1>
      <p className="text-lg mb-6">You are successfully onboarded with us. Please update your personal dashboard.</p>

      {/* Button to go to admin dashboard */}
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
