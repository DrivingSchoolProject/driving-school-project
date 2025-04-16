"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import Footer from "@/components/Footer"; // Import the new Footer component
import {
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function SelectCourse() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // The instructor's Firestore doc ID, passed in the query string (e.g., ?instructorId=XYZ)
  const instructorId = searchParams.get("instructorId");
  const dateTime = searchParams.get("date") + ", " + searchParams.get("time"); // Retrieve the dateTime param

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
      + `&dateTime=${encodeURIComponent(dateTime)}`
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
      <main className="flex-1 pt-24 px-4 pb-16">
        <h1 className="text-2xl font-bold mb-4 text-center">Select Course</h1>

        <div className="max-w-md w-full bg-white p-6 rounded shadow mx-auto">
          <h2 className="text-xl font-semibold mb-2">
            Instructor: {instructor.fullName || "Unknown"}
          </h2>
          {dateTime && (
            <p className="text-gray-700">
              Booking Date and Time: {new Date(dateTime).toLocaleString()}
            </p>
          )}

          {lessons.length === 0 ? (
            <p>No lessons found for this instructor.</p>
          ) : (
            <div className="space-y-4 mt-4">
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
        <div className="mt-6 flex justify-center space-x-4">
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
      </main>

      {/* FOOTER */}
      <Footer /> {/* Replace inline footer with Footer component */}
    </div>
  );
}