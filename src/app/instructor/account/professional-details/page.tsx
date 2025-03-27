"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function ProfessionalDetails() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    driversLicense: "",
    visionTest: "",
    criminalRecord: "",
    judicialReport: "",
    mtoCertificate: "",
    yearsOfExperience: "",
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    driversLicense: null,
    visionTest: null,
    criminalRecord: null,
    judicialReport: null,
    mtoCertificate: null,
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
        const data = docSnap.data();
        setFormData({
          driversLicense: data.professionalDetails?.driversLicense || "",
          visionTest: data.professionalDetails?.visionTest || "",
          criminalRecord: data.professionalDetails?.criminalRecord || "",
          judicialReport: data.professionalDetails?.judicialReport || "",
          mtoCertificate: data.professionalDetails?.mtoCertificate || "",
          yearsOfExperience: data.professionalDetails?.yearsOfExperience || "",
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) return;

    try {
      const storage = getStorage();
      const updatedData = { ...formData };

      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const storageRef = ref(storage, `professionalDocs/${user.uid}/${key}/${file.name}`);
          await uploadBytes(storageRef, file);
          updatedData[key] = await getDownloadURL(storageRef);
        }
      }

      await updateDoc(doc(db, "users", user.uid), { professionalDetails: updatedData });
      router.push("/instructor");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Professional Details</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 bg-white p-6 rounded-lg shadow-lg">
            {["driversLicense", "visionTest", "criminalRecord", "judicialReport", "mtoCertificate"].map((field) => (
              <div key={field}>
                <label className="block font-semibold capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange(e, field)}
                  className="w-full p-3 border rounded"
                  disabled={field === "mtoCertificate" && auth.currentUser?.role !== "admin"} // Admin-only
                />
                {formData[field] && (
                  <a href={formData[field]} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View Current Document
                  </a>
                )}
              </div>
            ))}
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="Years of Experience"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              min="0"
            />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Save Changes
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}