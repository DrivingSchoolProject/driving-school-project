"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";

export default function ContactInfo() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      state: "", // State or Province
      postalCode: "",
      country: "",
    },
    phone: "",
    email: "",
    bio: "",
    profilePicture: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
          firstName: data.contactInfo?.firstName || "",
          lastName: data.contactInfo?.lastName || "",
          address: {
            street: data.contactInfo?.address?.street || "",
            city: data.contactInfo?.address?.city || "",
            state: data.contactInfo?.address?.state || "",
            postalCode: data.contactInfo?.address?.postalCode || "",
            country: data.contactInfo?.address?.country || "",
          },
          phone: data.contactInfo?.phone || "",
          email: data.email || "",
          bio: data.contactInfo?.bio || "",
          profilePicture: data.contactInfo?.profilePicture || "",
        });
        setPreview(data.contactInfo?.profilePicture || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "postalCode", "country"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = auth.currentUser;
    if (!user) return;

    try {
      let profilePictureURL = formData.profilePicture;
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        profilePictureURL = await getDownloadURL(storageRef);
      }

      const updatedData = { ...formData, profilePicture: profilePictureURL };
      await updateDoc(doc(db, "users", user.uid), { contactInfo: updatedData });
      router.push("/instructor");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={`${formData.firstName} ${formData.lastName}`} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Contact Info</h1>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6 bg-white p-6 rounded-lg shadow-lg">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Profile Picture</h2>
              {preview && (
                <div className="flex justify-center">
                  <img src={preview} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover mb-4" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border rounded"
              />
            </div>

            {/* Personal Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Personal Info</h2>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Home Address Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Home Address</h2>
              <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Street Address"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State/Province"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                placeholder="Postal/ZIP Code"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                pattern="[A-Za-z0-9\- ]{5,10}"
                title="Enter a valid postal or ZIP code (5-10 characters)"
              />
              <input
                type="text"
                name="country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Contact Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Details</h2>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* About Me Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">About Me</h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Bio"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                rows={4}
              />
            </div>

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