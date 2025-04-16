// src/library/getUserById.ts

import { db } from "./firebaseAdmin";

// Define the expected shape of a user document
export interface User {
  id: string;
  name: string;
  email: string;
  stage: string;
}

export async function getUserById(userId: string): Promise<User | null> {
  const docRef = db.collection("users").doc(userId);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  // Return an object matching the User interface.
  return {
    id: snapshot.id,
    name: data?.name,
    email: data?.email,
    stage: data?.stage,
  };
}
