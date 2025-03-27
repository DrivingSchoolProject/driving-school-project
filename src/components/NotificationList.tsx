"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/library/firebase";
import { Notification } from "@/types";
import { subscribeToNotifications } from "@/utils/realTime";

const NotificationList: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notificationList) => {
      setNotifications(notificationList.map((notif) => ({
        id: notif.id,
        message: notif.message,
        type: notif.type || "default", // Provide default values if necessary
        read: notif.read || false,
        redirectPath: notif.redirectPath || "/"
      })) as Notification[]);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when toggling read status
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: !notif.read } : notif))
    );
    // Note: This only updates local state. To persist to Firestore, you'd need to call updateDoc here.
  };

  return (
    <div
      className="p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition"
      onClick={() => router.push("/instructor/notifications")}
    >
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.slice(0, 3).map((notif) => (
            <li
              key={notif.id}
              className={`p-2 rounded ${notif.read ? "bg-gray-100" : "bg-blue-100"}`}
              onClick={(e) => e.stopPropagation()} // Prevent parent navigation on individual item click
            >
              <span>{notif.message}</span>
              <button
                onClick={(e) => toggleRead(notif.id, e)}
                className="ml-2 text-sm text-blue-600"
              >
                {notif.read ? "Mark Unread" : "Mark Read"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;