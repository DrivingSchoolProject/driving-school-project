/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import EarningsOverview from "@/components/EarningsOverview";
import MessageList from "@/components/MessageList";
import Footer from "@/components/Footer";
import Link from "next/link";
import { subscribeToBookings, subscribeToNotifications } from "@/utils/realTime";

// Help Icon
const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface FAQ {
  question: string;
  answer: string;
}

interface ChatMessage {
  id: string;
  sender: "instructor" | "support";
  text: string;
  timestamp: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  useEffect(() => {
    console.log("Updated Bookings:", bookings);
  }, [bookings]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Help-related states
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const faqs: FAQ[] = [
    {
      question: "How do I set my lesson prices?",
      answer:
        "Go to 'Set Lesson Prices' under your account menu. You can add, edit, or delete lesson types and their prices there.",
    },
    {
      question: "How can I update my availability?",
      answer:
        "Navigate to 'Set Availability' in your account menu, select dates on the calendar, and choose available time slots.",
    },
    {
      question: "Why isn’t my profile picture uploading?",
      answer:
        "Ensure the file is an image (e.g., .jpg, .png) and under 5MB. Check your internet connection and try again.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer:
        "Visit 'Payment Method' in your account menu to set up bank details, Interac, or a debit card for withdrawals.",
    },
    {
      question: "What happens if a student cancels a booking?",
      answer:
        "You’ll receive a notification, and the booking status will update to 'cancelled' in your 'Bookings' section.",
    },
    {
      question: "How do I respond to student reviews?",
      answer: "Go to 'Reviews' in your account menu, find the review, and click 'Reply' to respond directly.",
    },
    {
      question: "Can I change my professional documents after submission?",
      answer:
        "Yes, except for the MTO certificate, which only admins can update. Edit other documents in 'Professional Details'.",
    },
  ];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists() || docSnap.data().role !== "instructor" || !docSnap.data().approved) {
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            fullName: user.displayName || "Instructor",
            role: "instructor",
            approved: true,
            bookings: [],
            messages: [],
            notifications: [],
          });
        }
        router.push(docSnap.exists() && !docSnap.data().approved ? "/pendingApproval" : "/login");
        return;
      }

      setUserData(docSnap.data());

      const unsubscribeBookings = subscribeToBookings(user.uid, "instructor", (bookingList) => {
        console.log("For Rezwan: Current user UID:", user.uid);
        console.log("Bookings from DB:", bookingList);
        setBookings(bookingList);
      });

      const unsubscribeNotifications = subscribeToNotifications(user.uid, (notificationList) => {
        console.log("Notifications from DB:", notificationList);
        setNotifications(notificationList);
      });

      setLoading(false);

      return () => {
        unsubscribeBookings();
        unsubscribeNotifications();
      };
    });

    return () => unsubscribeAuth();
  }, [router]);

  const getUpcomingBookings = (bookings: any[]) => {
    const now = new Date();
    return bookings.filter((booking) => {
      let bookingDate: Date;
      if (booking.date) {
        if (booking.date.toMillis) {
          bookingDate = new Date(booking.date.toMillis());
        } else {
          bookingDate = new Date(booking.date);
        }
      } else if (booking.createdAt) {
        bookingDate = booking.createdAt.toMillis
          ? new Date(booking.createdAt.toMillis())
          : new Date(booking.createdAt);
      } else {
        bookingDate = new Date();
      }

      console.log("Booking Date:", bookingDate, "Now:", now);
      const isUpcoming = bookingDate >= now;
      if (isUpcoming) {
        console.log("Upcoming Booking Found:", booking);
      }
      return isUpcoming;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    const matchedFAQ = faqs.find((faq) => faq.question.toLowerCase() === value.toLowerCase());
    setSelectedFAQ(matchedFAQ || null);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "instructor",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    setTimeout(() => {
      const supportResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "support",
        text: "Thanks for your message! We’re looking into it and will get back to you soon.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, supportResponse]);
    }, 1000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100 relative">
        <InstructorHeader fullName={userData?.fullName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Instructor Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Notifications */}
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              {notifications.length === 0 ? (
                <p>No new notifications.</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.slice(0, 3).map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-2 rounded ${notif.read ? "bg-gray-100" : "bg-blue-100"}`}
                      onClick={() => router.push(notif.redirectPath)}
                    >
                      {notif.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Earnings Overview */}
            <EarningsOverview />

            {/* Messages */}
            <MessageList />

            {/* Bookings */}
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Bookings</h2>
              {(() => {
                console.log("Current Bookings State:", bookings);
                const upcomingBookings = getUpcomingBookings(bookings);
                console.log("Upcoming Bookings:", upcomingBookings);
                return upcomingBookings.length === 0 ? (
                  <p>No upcoming bookings.</p>
                ) : (
                  <ul className="space-y-2">
                    {upcomingBookings.slice(0, 3).map((booking, index) => {
                      let displayDate: Date;
                      if (booking.date) {
                        displayDate = booking.date.toMillis
                          ? new Date(booking.date.toMillis())
                          : new Date(booking.date);
                      } else if (booking.createdAt) {
                        displayDate = booking.createdAt.toMillis
                          ? new Date(booking.createdAt.toMillis())
                          : new Date(booking.createdAt);
                      } else {
                        displayDate = new Date();
                      }

                      const bookingId = booking.id || `${booking.studentId}-${index}`;

                      return (
                        <li
                          key={bookingId}
                          className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                          onClick={() => router.push(`/instructor/bookings/${bookingId}`)}
                        >
                          {booking.studentEmail} - {booking.courseType} (
                          {isNaN(displayDate.getTime())
                            ? "Invalid Date"
                            : displayDate.toLocaleDateString()}
                          )
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </div>
          </div>

          {/* Quick Links */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/instructor/feedback" className="p-4 bg-white rounded shadow hover:bg-gray-50">
                Feedback
              </Link>
            </div>
          </section>
        </main>

        {/* Floating Help Icon */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed bottom-6 right-6 bg-green-600 p-4 rounded-full shadow-lg hover:bg-green-700 transition z-50"
          aria-label="Open Help"
        >
          <HelpIcon />
        </button>

        {/* Help Modal */}
        {isHelpOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close Help"
              >
                ✕
              </button>
              <h1 className="text-2xl font-bold mb-4 text-center">Help & Support</h1>

              {/* FAQ Suggestions */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-center">FAQs</h2>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search FAQs..."
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                  list="faqSuggestions"
                />
                <datalist id="faqSuggestions">
                  {faqs.map((faq, index) => (
                    <option key={index} value={faq.question} />
                  ))}
                </datalist>
                {selectedFAQ && (
                  <div className="p-3 bg-gray-100 rounded">
                    <h3 className="text-md font-semibold text-green-700">{selectedFAQ.question}</h3>
                    <p className="text-gray-700 text-sm">{selectedFAQ.answer}</p>
                  </div>
                )}
              </div>

              {/* Chat Interface */}
              <div className="space-y-4 mt-4">
                <h2 className="text-lg font-semibold text-center">Chat with Support</h2>
                <div className="h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg shadow-inner">
                  {chatMessages.length === 0 ? (
                    <p className="text-gray-500 text-center text-sm">Start a conversation...</p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-2 p-2 rounded-lg text-sm ${
                          msg.sender === "instructor" ? "bg-green-100 text-right" : "bg-blue-100 text-left"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleChatSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
}