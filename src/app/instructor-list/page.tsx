"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase";
import Footer from "@/components/Footer"; // Import the new Footer component
import {
  collection,
  query,
  where,
  getDocs,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import Link from "next/link";

// Shape of each availability slot (used only for filtering)
interface AvailabilitySlot {
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

// Define the shape of our instructor data
export interface InstructorData {
  id: string;
  fullName: string;
  profilePic?: string;
  bestReview?: string;
  availability?: AvailabilitySlot[]; // used for filtering only
  // add other fields as needed
}

// Create a Firestore data converter for InstructorData
const instructorConverter: FirestoreDataConverter<InstructorData> = {
  toFirestore(instructor: InstructorData) {
    return {
      fullName: instructor.fullName,
      profilePic: instructor.profilePic,
      bestReview: instructor.bestReview,
      availability: instructor.availability,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): InstructorData {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      fullName: data.fullName,
      profilePic: data.profilePic,
      bestReview: data.bestReview,
      availability: data.availability,
    };
  },
};

export default function InstructorList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get requested date and time from query parameters
  const requestedDate = searchParams.get("date"); // e.g. "2025-03-26"
  const requestedTime = searchParams.get("time"); // e.g. "10:00"

  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        // Create a collection reference with the converter attached.
        const instructorsRef = collection(db, "users").withConverter(instructorConverter);
        const instructorsQuery = query(
          instructorsRef,
          where("role", "==", "instructor"),
          where("approved", "==", true)
        );

        const snap = await getDocs(instructorsQuery);
        const allInstructors: InstructorData[] = snap.docs.map((doc) => doc.data());

        // Filter by date & time if provided
        let filteredInstructors = allInstructors;
        if (requestedDate && requestedTime) {
          filteredInstructors = allInstructors.filter((inst) => {
            // If the instructor has an availability array, check if any slot matches
            if (!inst.availability || inst.availability.length === 0) {
              return false;
            }
            // At least one slot must match the requested date and the requested time must fall within the slot's time range.
            return inst.availability.some((slot) => {
              if (slot.date === requestedDate) {
                // Compare times as strings in "HH:mm" format (ensure leading zeros)
                return requestedTime >= slot.startTime && requestedTime <= slot.endTime;
              }
              return false;
            });
          });
        }

        setInstructors(filteredInstructors);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [requestedDate, requestedTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <header className="w-full p-4 bg-black text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Driving School</h1>
          <Link href="/">Home</Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="p-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Available Instructors</h2>
        {requestedDate && requestedTime && (
          <p className="mb-4 text-center">
            Showing instructors available on {requestedDate} at {requestedTime}
          </p>
        )}

        <div className="flex flex-col items-center space-y-4">
          {instructors.length === 0 ? (
            <p className="text-gray-700">No instructors found for that date/time.</p>
          ) : (
            instructors.map((inst) => (
              <Link
                key={inst.id}
                href={`/select-course?instructorId=${inst.id}&date=${requestedDate}&time=${requestedTime}`}
                className="block w-full max-w-xl p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={inst.profilePic || "/default-avatar.png"}
                    alt={inst.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{inst.fullName}</h3>
                    <p className="text-sm text-gray-600">Rating: ⭐⭐⭐⭐⭐</p>
                    <p className="text-gray-500 text-sm">{inst.bestReview || "Great Instructor!"}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
{/* FOOTER */}
      <Footer /> {/* Replace inline footer with Footer component */}
    </div>
  );
}
