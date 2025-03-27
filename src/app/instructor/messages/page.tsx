"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/library/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";
import { subscribeToMessages } from "@/utils/realTime";

export default function MessagesPage() {
  const router = useRouter();
  interface Message {
    id: string;
    studentId: string;
    conversation: { text: string }[];
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const unsubscribe = subscribeToMessages(user.uid, "instructor", (messages: { [key: string]: unknown; id: string; }[]) => {
      const messageList: Message[] = messages.map(msg => ({
        id: msg.id,
        studentId: msg.studentId as string,
        conversation: msg.conversation as { text: string }[]
      }));
      setMessages(messageList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Messages</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            {messages.length === 0 ? (
              <p>No messages available.</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((msg) => (
                  <li
                    key={msg.id}
                    className="p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                    onClick={() => router.push(`/instructor/messages/${msg.id}`)}
                  >
                    <strong>{msg.studentId}</strong>: {msg.conversation[0]?.text}
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