"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function InstructorList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Optional: if you're filtering by date/time, read them here
  const requestedDate = searchParams.get("date"); 
  const requestedTime = searchParams.get("time"); 

  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        // 1. Query all approved instructors
        const instructorsQuery = query(
          collection(db, "users"),
          where("role", "==", "instructor"),
          where("approved", "==", true)
        );
        const snap = await getDocs(instructorsQuery);
        const allInstructors = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 2. (Optional) Filter by availability if needed
        // For now, we skip filtering and just show all

        setInstructors(allInstructors);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Instructors</h1>

      {/* Single column, centered */}
      <div className="flex flex-col items-center space-y-4">
        {instructors.map((inst) => (
          <Link
            key={inst.id}
            href={`/select-course?instructorId=${inst.id}`}
            className="block w-full max-w-xl p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <img
                src={inst.profilePic || "/default-avatar.png"}
                alt={inst.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold">{inst.fullName}</h2>
                <p className="text-sm text-gray-600">Rating: ⭐⭐⭐⭐⭐</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Back
      </button>
    </div>
  );
}