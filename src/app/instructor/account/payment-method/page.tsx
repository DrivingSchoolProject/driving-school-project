"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function PaymentMethod() {
  const router = useRouter();
  const [method, setMethod] = useState("bank");
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    interacEmail: "",
    cardNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().paymentMethod || {};
        setFormData({
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          routingNumber: data.routingNumber || "",
          interacEmail: data.interacEmail || "",
          cardNumber: data.cardNumber || "",
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), { paymentMethod: { method, ...formData } });
      router.push("/instructor");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fee = method === "interac" ? 2.5 : 0;

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Payment Method</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 bg-white p-6 rounded-lg shadow-lg">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="bank">Bank Transfer (No Fee)</option>
              <option value="interac">Interac ($2.50 Fee)</option>
              <option value="card">Debit Card (No Fee)</option>
            </select>
            {method === "bank" && (
              <>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Bank Name"
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                  className="w-full p-3 border rounded"
                />
                <input
                  type="text"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleChange}
                  placeholder="Routing Number"
                  className="w-full p-3 border rounded"
                />
              </>
            )}
            {method === "interac" && (
              <input
                type="email"
                name="interacEmail"
                value={formData.interacEmail}
                onChange={handleChange}
                placeholder="Interac Email"
                className="w-full p-3 border rounded"
              />
            )}
            {method === "card" && (
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="Card Number"
                className="w-full p-3 border rounded"
              />
            )}
            <p className="text-sm text-gray-600">Withdrawal Fee: ${fee.toFixed(2)}</p>
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Save Payment Method
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}