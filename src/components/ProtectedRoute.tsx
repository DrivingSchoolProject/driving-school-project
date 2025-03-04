"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push("/login"); // ✅ Redirect if not logged in
          return;
        }

        // Fetch user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          router.push("/login");
          return;
        }

        const userData = userDocSnap.data();
        if (!allowedRoles.includes(userData.role)) {
          router.push("/login"); // ✅ Redirect unauthorized users
          return;
        }

        setAuthorized(true); // ✅ User is allowed to access the page
        setLoading(false);
      });
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return authorized ? <>{children}</> : null;
}
