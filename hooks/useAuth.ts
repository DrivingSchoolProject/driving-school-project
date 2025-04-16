// /hooks/useAuth.ts
import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/library/firebase';

export const useAuth = () => {
  const [error, setError] = useState<string>('');  // Define the state for error
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    console.log("Form data:", email, password);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user document from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        return { userData, user };
      } else {
        throw new Error('No user data found.');
      }
    } catch (err: any) {
      console.error("Error signing in:", error);
      setError(err.message);  // Set the error state here
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { login, logout, error, setError, loading };  // Return setError as well
};
