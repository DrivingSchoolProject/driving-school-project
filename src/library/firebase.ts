// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAaheLWZWgiPp4pAwIkuZPKN7DE6dqcMg",
    authDomain: "drivingschool-b441c.firebaseapp.com",
    projectId: "drivingschool-b441c",
    storageBucket: "drivingschool-b441c.firebasestorage.app",
    messagingSenderId: "430524618125",
    appId: "1:430524618125:web:62780f357c4ce2cc5359c4",
    measurementId: "G-3GH23HRYY2"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
