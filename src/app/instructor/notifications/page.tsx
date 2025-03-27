"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";
import { subscribeToNotifications } from "@/utils/realTime";

export default function NotificationsPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const unsubscribe = subscribeToNotifications(user.uid, (notificationList: { [key: string]: unknown; id: string; message: string; }[]) => {
      setNotifications(notificationList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const toggleRead = async (id: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: !notif.read } : notif
    );
    setNotifications(updatedNotifications);
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { notifications: updatedNotifications });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">All Notifications</h1>
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            {notifications.length === 0 ? (
              <p>No notifications available.</p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`p-4 rounded cursor-pointer ${notif.read ? "bg-gray-100" : "bg-blue-100"}`}
                    onClick={() => router.push(notif.redirectPath)}
                  >
                    <span>{notif.message}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(notif.id);
                      }}
                      className="ml-2 text-sm text-blue-600"
                    >
                      {notif.read ? "Mark Unread" : "Mark Read"}
                    </button>
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