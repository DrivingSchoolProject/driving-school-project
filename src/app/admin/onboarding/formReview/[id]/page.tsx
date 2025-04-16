"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase"; // Your Firebase client config
import { doc, getDoc } from "firebase/firestore";

// Adjust this interface to match your Firestore document fields
interface UserData {
  fullName?: string;
  email?: string;
  experience?: string; // e.g. "Tell us about your experience"
  licenseNumber?: string;
  files?: Record<string, string>; // e.g. { fileName: fileUrl }
  stage?: string;
}

export default function ReviewPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Destructure [id] from URL, enforce as string
  const { id } = useParams() as { id: string };
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      // If there's no valid ID, skip Firestore call
      if (!id) {
        console.error("No user ID provided in the URL.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", id);
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
  }, [id]);

  // Handlers to push user to Accept or Reject pages
  const handleAccept = () => {
    router.push(`/admin/onboarding/formReview/${id}/accept`);
  };

  const handleReject = () => {
    router.push(`/admin/onboarding/formReview/${id}/reject`);
  };

  if (loading) {
    return <div className="p-6">Loading user data...</div>;
  }

  if (!userData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>No user exists with ID: {id}</p>
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
            <td className="py-2 px-4 border font-semibold">
              Experience as Driving Instructor
            </td>
            <td className="py-2 px-4 border">
              {userData.experience || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4 border font-semibold">License Number</td>
            <td className="py-2 px-4 border">
              {userData.licenseNumber || "N/A"}
            </td>
          </tr>

          {/* Display Files if present */}
          {userData.files &&
            Object.entries(userData.files).map(([fileName, fileUrl]) => (
              <tr key={fileName}>
                <td className="py-2 px-4 border font-semibold">
                  {fileName.replace(/([A-Z])/g, " $1").toUpperCase()}
                </td>
                <td className="py-2 px-4 border">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {fileName.replace(/([A-Z])/g, " $1")}
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Show Accept/Reject buttons only if stage is 'L2 Form Submitted' */}
      {userData.stage === "L2 Form Submitted" && (
        <div className="flex justify-center mb-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleReject}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}