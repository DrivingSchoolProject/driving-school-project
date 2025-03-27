"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function ChatPage() {
  const router = useRouter();
  const { id } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [message, setMessage] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "messages", id as string), (docSnap) => {
      if (docSnap.exists() && docSnap.data().instructorId === user.uid) {
        setMessage({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !message) return;

    const newMessage = {
      sender: auth.currentUser?.displayName || "Instructor",
      text: reply,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = [...message.conversation, newMessage];
    await updateDoc(doc(db, "messages", id as string), { conversation: updatedConversation });
    setReply("");

    // Notify student
    const studentRef = doc(db, "users", message.studentId);
    const studentSnap = await getDoc(studentRef);
    await updateDoc(studentRef, {
      notifications: [
        ...(studentSnap.data()?.notifications || []),
        {
          id: Date.now().toString(),
          type: "message",
          message: `New message from ${auth.currentUser?.displayName} regarding your booking`,
          read: false,
          redirectPath: `/student/messages/${id}`,
        },
      ],
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!message) return <div className="flex items-center justify-center h-screen">Message not found.</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6 pb-20">
          <h1 className="text-3xl font-bold mb-6 text-center">Chat with {message.studentId}</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4">
            {message.bookingId && (
              <p className="text-sm text-gray-600">
                <strong>Related Booking:</strong>{" "}
                <a href={`/instructor/bookings/${message.bookingId}`} className="text-blue-600 underline">
                  View Booking #{message.bookingId}
                </a>
              </p>
            )}
            <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner">
              {message.conversation.map((msg: { sender: string; text: string; timestamp: string }, index: number) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-lg ${
                    msg.sender === auth.currentUser?.displayName ? "bg-green-100 text-right" : "bg-blue-100 text-left"
                  }`}
                >
                  <p className="text-sm">
                    <strong>{msg.sender}</strong>: {msg.text}
                  </p>
                  <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleReply} className="flex space-x-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Send
              </button>
            </form>
            <button
              onClick={() => router.push("/instructor/messages")}
              className="w-full py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Messages
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}