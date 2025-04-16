"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/library/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

interface SuccessPageProps {
  params: { id: string }; // We are assuming you are getting params via Next.js dynamic routes
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", params.id);
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          setUserData(docSnapshot.data());
          // After the user data is fetched, update the stage to L2 Form Submitted
          await updateDoc(userRef, {
            stage: "L2 Form Submitted", // Change the stage to L2 Form Submitted
          });
          console.log("Stage updated to L2 Form Submitted.");
        } else {
          console.error("User data not found!");
        }
      } catch (error) {
        console.error("Error fetching or updating user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id]); // This runs once when the page loads

  const handleBackToDashboard = () => {
    router.push("/instructor"); // Navigate back to the onboarding page
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Congratulations, Document Uploaded Successfully!
      </h1>
      <p className="mb-6 text-center">
        You have successfully uploaded all required documents.
      </p>

      {/* Button to go back to the onboarding page */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleBackToDashboard}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Back to Home Page
        </button>
      </div>
    </div>
  );
}
