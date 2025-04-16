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

export default function ReviewPage() {
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

  //  Button handlers (with navigation to Document Upload page)
  const handleSendViaText = async () => {
    const userRef = doc(db, "users", params.id);

    try {
      await updateDoc(userRef, {
        stage: "Upload", // Change the stage to Upload
      });

      if (params?.id) {
      router.push(`/admin/onboarding/review/${params.id}/success`); // You can modify the redirection as needed
      }else {
        console.error("User ID not found!");
      }

    } catch (error) {
      console.error("Error updating user stage to 'Upload':", error);
    }

  };

  const handleSendViaEmail = async () => {
    const userRef = doc(db, "users", params.id);

    try {
      await updateDoc(userRef, {
        stage: "Upload", // Change the stage to Upload
      });

      if (params?.id) {
      router.push(`/admin/onboarding/review/${params.id}/success`); // You can modify the redirection as needed
      }else {
        console.error("User ID not found!");
      }

    } catch (error) {
      console.error("Error updating user stage to 'Upload':", error);
    }
  };

  const handleReject = async () => {
    console.log("Rejecting user:", params.id);

    // Update Firestore to set the stage to "Rejected"
    const userRef = doc(db, "users", params.id);

    try {
      await updateDoc(userRef, {
        stage: "rejected", // Change the stage to Rejected
      });

      console.log("User rejected, stage updated to 'Rejected'");

      // Optionally, redirect to another page, e.g., admin dashboard
      router.push("/admin/onboarding"); // You can modify the redirection as needed
    } catch (error) {
      console.error("Error updating user stage to 'Rejected':", error);
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
      <h1 className="text-3xl font-bold mb-6">Reviewing {userData.fullName}</h1>

      {/* Display user info in a table */}
      <table className="min-w-full bg-white border rounded-lg mb-6">
        <tbody>
          <tr>
            <td className="py-2 px-4 border font-semibold">Full Name</td>
            <td className="py-2 px-4 border">{userData.fullName || "N/A"}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border font-semibold">Email Address</td>
            <td className="py-2 px-4 border">{userData.email || "N/A"}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border font-semibold">Driver's License Number</td>
            <td className="py-2 px-4 border">
              {userData.licenseNumber || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4 border font-semibold">
              Experience as Driving Instructor
            </td>
            <td className="py-2 px-4 border">
              {userData.experience || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSendViaText}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Send via Text
        </button>
        <button
          onClick={handleSendViaEmail}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Send via Email
        </button>
        <button
          onClick={handleReject}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
