"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/library/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Route protection added

interface Instructor {
  id: string;
  fullName: string;
  email: string;
  experience: string;
  licenseNumber: string;
  documentURL?: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [pendingInstructors, setPendingInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch pending instructors
  useEffect(() => {
    const fetchPendingInstructors = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "instructor"),
          where("approved", "==", false)
        );
        const querySnapshot = await getDocs(q);
        const instructors: Instructor[] = [];
        querySnapshot.forEach((docSnap) => {
          instructors.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Instructor, "id">),
          });
        });
        setPendingInstructors(instructors);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPendingInstructors();
  }, []);

  // Approve instructor
  const handleApprove = async (id: string) => {
    try {
      const instructorRef = doc(db, "users", id);
      await updateDoc(instructorRef, { approved: true });
      setPendingInstructors((prev) => prev.filter((inst) => inst.id !== id));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // Reject instructor (delete their record)
  const handleReject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setPendingInstructors((prev) => prev.filter((inst) => inst.id !== id));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="font-sans min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-black bg-opacity-70 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="text-2xl font-bold text-white">
            <Link href="/">Driving School</Link>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gray-100 pt-24 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Admin Panel - Pending Instructor Approvals
          </h1>

          {loading ? (
            <p className="text-center">Loading pending instructors...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : pendingInstructors.length === 0 ? (
            <p className="text-center">No pending instructors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Experience</th>
                    <th className="py-2 px-4 border">License Number</th>
                    <th className="py-2 px-4 border">Document</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInstructors.map((inst) => (
                    <tr key={inst.id}>
                      <td className="py-2 px-4 border">{inst.fullName}</td>
                      <td className="py-2 px-4 border">{inst.email}</td>
                      <td className="py-2 px-4 border">{inst.experience}</td>
                      <td className="py-2 px-4 border">{inst.licenseNumber}</td>
                      <td className="py-2 px-4 border">
                        {inst.documentURL ? (
                          <a
                            href={inst.documentURL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Document
                          </a>
                        ) : (
                          "No Document"
                        )}
                      </td>
                      <td className="py-2 px-4 border space-x-2">
                        <button
                          onClick={() => handleApprove(inst.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(inst.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
