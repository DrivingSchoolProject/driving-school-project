"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/library/firebase"; // Your Firebase client config
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";

interface OnboardingRequest {
  id: string;
  fullName: string;
  email: string;
  stage: string;
}

export default function OnboardingRequests() {
  const [requests, setRequests] = useState<OnboardingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all onboarding requests, filtering out "rejected" instructors
  useEffect(() => {
    const fetchOnboardingRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data: OnboardingRequest[] = [];

        snapshot.forEach((doc) => {
          const userData = doc.data();
          const stage = userData?.stage?.toLowerCase();
          
          // Filter: must be an instructor and not "rejected"
          if (userData?.role === "instructor" && stage !== "rejected") {
            data.push({
              id: doc.id,
              fullName: userData.fullName || "No Name",
              email: userData.email || "No Email",
              stage: userData.stage || "N/A",
            });
          }
        });

        setRequests(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching onboarding requests:", err);
        setError("Failed to fetch onboarding requests.");
        setLoading(false);
      }
    };

    fetchOnboardingRequests();
  }, []);

  // Navigate to the correct review page
  const handleReviewClick = (request: OnboardingRequest) => {
    // Example logic: if stage is 'initial', go to "review" page; otherwise to "formReview" page
    if (request.stage.toLowerCase() === "initial") {
      router.push(`/admin/onboarding/review/${request.id}`);
    } else {
      router.push(`/admin/onboarding/formReview/${request.id}`);
    }
  };

  // Utility for categorizing requests by the 4 known stages + 'N/A'
  function categorizeRequests(reqs: OnboardingRequest[]) {
    // Lowercase comparison keys
    const categories = {
      initial: [] as OnboardingRequest[],
      upload: [] as OnboardingRequest[],
      l2FormSubmitted: [] as OnboardingRequest[],
      accepted: [] as OnboardingRequest[],
      nA: [] as OnboardingRequest[],
    };

    reqs.forEach((r) => {
      const stageLower = r.stage.toLowerCase();
      if (stageLower === "initial") {
        categories.initial.push(r);
      } else if (stageLower === "upload") {
        categories.upload.push(r);
      } else if (stageLower === "l2 form submitted") {
        categories.l2FormSubmitted.push(r);
      } else if (stageLower === "accepted") {
        categories.accepted.push(r);
      } else {
        categories.nA.push(r);
      }
    });

    return categories;
  }

  // Determine the appropriate background color for each stage
  function stageColor(stage: string) {
    switch (stage.toLowerCase()) {
      case "initial":
        return "bg-blue-500 text-white";
      case "upload":
        return "bg-orange-500 text-white";
      case "l2 form submitted":
        return "bg-purple-500 text-white";
      case "accepted":
        return "bg-green-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  }

  // Renders a table for one category of requests
  function renderRequestSection(title: string, data: OnboardingRequest[]) {
    if (data.length === 0) return null; // Hide the section if there are no entries
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Stage</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((request) => (
              <tr key={request.id}>
                <td className="py-2 px-4 border">{request.fullName}</td>
                <td className="py-2 px-4 border">{request.email}</td>
                <td className="py-2 px-4 border">
                  <span
                    className={`px-2 py-1 rounded ${stageColor(request.stage)}`}
                  >
                    {request.stage}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    onClick={() => handleReviewClick(request)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Prepare the grouped data
  const groupedRequests = categorizeRequests(requests);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Onboarding Requests</h1>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && requests.length === 0 && (
        <p className="text-center">No onboarding requests found.</p>
      )}

      {/* Render each section/table for the different stages */}
      {!loading && !error && requests.length > 0 && (
        <>
          {renderRequestSection("Initial", groupedRequests.initial)}
          {renderRequestSection("Upload", groupedRequests.upload)}
          {renderRequestSection("L2 Form Submitted", groupedRequests.l2FormSubmitted)}
          {renderRequestSection("Accepted", groupedRequests.accepted)}
          {renderRequestSection("N/A", groupedRequests.nA)}
        </>
      )}
    </div>
  );
}
