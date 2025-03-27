"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/library/firebase";
import { subscribeToMessages } from "@/utils/realTime";

const MessageList: React.FC = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToMessages(user.uid, "instructor", (messageList) => {
      setMessages(messageList);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  return (
    <div
      className="p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition"
      onClick={() => router.push("/instructor/messages")}
    >
      <h2 className="text-xl font-semibold mb-4">Messages</h2>
      {messages.length === 0 ? (
        <p>No open chats.</p>
      ) : (
        <ul className="space-y-2">
          {messages.slice(0, 3).map((msg) => (
            <li key={msg.id} className="p-2 bg-gray-100 rounded">
              <strong>{msg.studentId}</strong>: {msg.conversation[0]?.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageList;