"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function LessonHistory() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lessons, setLessons] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLessons(docSnap.data().lessonHistory || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.studentName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Lesson History</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name"
              className="w-full p-3 border rounded mb-4"
            />
            <p>Total Lessons: {lessons.length}</p>
            {filteredLessons.length === 0 ? (
              <p>No lessons found.</p>
            ) : (
              <ul className="space-y-2">
                {filteredLessons.map((lesson, index) => (
                  <li key={index} className="p-2 bg-gray-100 rounded">
                    {lesson.date} - {lesson.studentName} - {lesson.type} - {lesson.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}