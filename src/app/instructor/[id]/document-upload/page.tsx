"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/library/firebase"; // Firebase Firestore instance
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Files {
  [key: string]: File | null;
}

const DocumentUploadPage = () => {
  const [files, setFiles] = useState<Files>({});
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams(); // Get the [id] from the URL
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter for navigation

  // Handle file selection and update the state safely checking for 'files'
// Handle file selection and update the state safely checking for 'files'
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
  const fileList = e.target.files;
  if (!fileList || fileList.length === 0) return;
  setFiles((prev: Files) => ({
    ...prev,
    [fieldName]: fileList[0],
  }));
};


  // Handle form submission ensuring all required documents are uploaded
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Define the required document fields
    const requiredDocs = [
      "driverLicense",
      "drivingSchoolInstructorLicense",
      "visiontestReport",
      "criminalRecordReport",
      "drivingInstructorCourseCertificate",
      "cglInsuranceCertificate",
      "safetyStandardCertificate",
      "vehicleRegistration",
    ];

    // Validate that all required files are uploaded
    const allFilesUploaded = requiredDocs.every((doc) => files[doc]);
    if (!allFilesUploaded) {
      setError("Please upload all required documents.");
      setLoading(false);
      return;
    }

    // Extract userId, handling cases where it might be an array or undefined
    const userId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!userId) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const storage = getStorage();
      const fileUrls: { [key: string]: string } = {};

      // Iterate over each file and upload it to Firebase Storage
      for (const [fieldName, file] of Object.entries(files)) {
        if (file) {
          const fileRef = ref(storage, `documents/${userId}/${fieldName}/${file.name}`);
          await uploadBytes(fileRef, file);
          const fileURL = await getDownloadURL(fileRef);
          fileUrls[fieldName] = fileURL;
        }
      }

      // Save the URLs in Firestore using merge to avoid overwriting existing fields
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          files: fileUrls,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Navigate to the success page after uploading
      router.push(`/instructor/${userId}/document-upload/success`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Document Upload (ID: {params.id})</h1>
      <p className="mb-6">
        Please upload all the required documents below. You must provide each document to proceed.
      </p>

      {/* Form for file uploads */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">
            Upload Driver’s License (G or Higher with no demerit points)
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "driverLicense")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload Provincial Driving School Instructor License
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "drivingSchoolInstructorLicense")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Upload Vision Test Report</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "visiontestReport")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload Criminal Record & Judicial Matters Report
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "criminalRecordReport")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload MTO-approved driving instructor's course certificate
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "drivingInstructorCourseCertificate")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload Commercial General Liability (CGL) Insurance Certificate
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "cglInsuranceCertificate")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload Valid Safety Standard Certificate
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "safetyStandardCertificate")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload Provincial Vehicle Registration
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "vehicleRegistration")}
            accept=".pdf,.jpg,.png"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-2 mt-4 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit"}
        </button>

        {/* Error message */}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default DocumentUploadPage;
