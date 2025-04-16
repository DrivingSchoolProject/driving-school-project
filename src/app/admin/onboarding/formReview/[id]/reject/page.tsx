// pages/admin/onboarding/formReview/[id]/reject/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase"; // Your Firebase client config
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Adjust this interface to match your Firestore document fields
interface UserData {
  fullName?: string;
  email?: string;
  licenseNumber?: string;
  experience?: string; // e.g. "Tell us about your experience"
}

export default function RejectPage() {
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
    // Update the user stage to "Rejected"
    if (params?.id) {
      const userRef = doc(db, "users", params.id);

      updateDoc(userRef, {
        stage: "rejected", // Set stage to "rejected"
      }).then(() => {
        console.log("User rejected and stage updated to 'Rejected'");
        // Redirect to admin dashboard
        router.push("/admin/onboarding");
      }).catch((error) => {
        console.error("Error updating user stage to 'Rejected':", error);
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


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dear {userData.fullName}</h1>
      <p className="text-lg mb-6">Thank you for submitting your certification details. After reviewing your documents, we regret to inform you that your application does not currently meet the requirements to become an instructor on our platform.</p>

      <p className="text-lg mb-6">
        We understand that this may be disappointing. To better assist you, we recommend reaching out to our support team to clarify any specific concerns or resolve the issue. They will be happy to guide you through the next steps or answer any questions you may have.
      </p>

      <p className="text-lg mb-6">
        You can contact us by:
      </p>
      <ul className="mb-6">
        <li>Email: <a href="mailto:support@email.com" className="text-blue-600">support@email.com</a></li>
        <li>Phone: <a href="tel:+123456789" className="text-blue-600">+1 (234) 567-89</a></li>
        <li>Live Chat: <a href="https://example.com/live-chat" className="text-blue-600" target="_blank" rel="noopener noreferrer">Click here to start a Live Chat</a></li>
      </ul>

      <p className="text-lg mb-6">
        We appreciate your understanding and look forward to helping you get back on track.
      </p>

      <p className="text-lg mb-6">Best regards,</p>
      <p className="text-lg font-bold mb-6">The [Your Platform Name] Team</p>

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
