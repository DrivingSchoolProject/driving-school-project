import { db } from "@/library/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

export const subscribeToBookings = (
  userId: string,
  role: "instructor" | "student",
  callback: (bookings: { id: string; [key: string]: unknown }[]) => void
) => {
  const userRef = doc(db, "users", userId);

  return onSnapshot(userRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      const bookings = userData.bookings || []; // Ensure bookings exist
      console.log("Fetched bookings:", bookings);
      callback(bookings);
    } else {
      console.log("User document not found.");
      callback([]);
    }
  });
};

export const subscribeToMessages = (
  userId: string,
  role: "instructor" | "student",
  callback: (messages: { id: string; [key: string]: unknown }[]) => void
) => {
  const q = query(
    collection(db, "messages"),
    where(role === "instructor" ? "instructorId" : "studentId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const messageList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messageList);
  });
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: { id: string; message: string; [key: string]: unknown }[]) => void
) => {
  const docRef = doc(db, "users", userId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().notifications || []);
    }
  });
};