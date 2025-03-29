"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SelectCourse() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // The instructor's Firestore doc ID, passed in the query string (e.g., ?instructorId=XYZ)
  const instructorId = searchParams.get("instructorId");

  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Track which lesson is selected (only one)
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!instructorId) {
      setLoading(false);
      return;
    }

    const fetchInstructor = async () => {
      try {
        // Fetch the instructor doc from Firestore
        const docRef = doc(db, "users", instructorId);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          // Include the Firestore doc ID as 'id' in the object
          setInstructor({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Error fetching instructor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [instructorId]);

  if (!instructorId) {
    return (
      <div className="p-4">
        <h2 className="text-red-500">No instructor ID provided.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading instructor...
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="p-4">
        <h2 className="text-red-500">Instructor not found.</h2>
      </div>
    );
  }

  // The instructor doc is found. Let's read their lessons array
  const lessons = instructor.lessons || [];

  // Handle the "Proceed" button click
  const handleProceed = () => {
    if (selectedLessonIndex === null) {
      alert("Please select a course first!");
      return;
    }

    const chosenLesson = lessons[selectedLessonIndex];

    // Pass instructorId, instructorName, courseType, and price to the ConfirmBooking page
    router.push(
      `/confirm-booking?instructorId=${encodeURIComponent(instructor.id)}`
      + `&instructorName=${encodeURIComponent(instructor.fullName || "")}`
      + `&courseType=${encodeURIComponent(chosenLesson.type)}`
      + `&price=${encodeURIComponent(chosenLesson.price)}`
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Select Course</h1>

      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">
          Instructor: {instructor.fullName || "Unknown"}
        </h2>

        {lessons.length === 0 ? (
          <p>No lessons found for this instructor.</p>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson: any, idx: number) => {
              const isSelected = idx === selectedLessonIndex;
              return (
                <div
                  key={idx}
                  className="p-3 border rounded shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-lg">{lesson.type}</h3>
                    <p className="text-gray-700">Price: ${lesson.price}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLessonIndex(idx)}
                    className={`text-2xl px-3 py-1 rounded ${
                      isSelected
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons at the bottom */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleProceed}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}