/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Instructor {
  id: string;
  fullName: string;
  email: string;
  experience: string;
  licenseNumber: string;
  documentURL?: string;
  approved: boolean;
  contactInfo?: {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    bio: string;
    profilePicture?: string;
  };
  professionalDetails?: {
    driversLicense?: string;
    visionTest?: string;
    criminalRecord?: string;
    judicialReport?: string;
    mtoCertificate?: string;
    yearsOfExperience: string;
  };
}

export interface Lesson {
  id: string;
  type: string;
  price: number;
}

export interface Booking {
  id: string;
  studentName: string;
  studentEmail: string; // Added to match database
  studentId: string;
  instructorId: string; // Added to ensure instructorId is always present
  lessonType: string;
  date: string | any; // Can be a string or Firestore Timestamp
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "requested";
  notes?: string;
  basePrice: number;
  taxAmount: number;
  totalPrice: number;
  createdAt: string | any; // Can be a string or Firestore Timestamp
}

export type StudentPreferences = {
  age: number;
  experienceLevel: string;
  gender: string;
  instructorGender: string;
  languagePreference: string;
  specialRequirements?: string;
  vehiclePreference: string;
};

export interface Notification {
  id: string;
  type: "message" | "reservation" | "payment" | "booking_update" | "reschedule";
  message: string;
  read: boolean;
  redirectPath: string;
}

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}