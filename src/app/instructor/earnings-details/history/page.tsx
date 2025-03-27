"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/library/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorHeader from "@/components/InstructorHeader";
import Footer from "@/components/Footer";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EarningsEntry {
  date: string;
  amount: number;
  description: string;
}

export default function EarningsHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<EarningsEntry[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const entriesPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHistory(
          docSnap.data().earningsHistory || [
            { date: "2025-03-01", amount: 100, description: "Lesson with John" },
            { date: "2025-03-02", amount: 150, description: "Lesson with Jane" },
            { date: "2025-03-03", amount: 200, description: "Refresher Course" },
            { date: "2025-03-04", amount: 120, description: "New Driver Lesson" },
            { date: "2025-03-05", amount: 180, description: "Lesson with Mike" },
          ]
        );
      }
      setLoading(false);
    };
    fetchHistory();
  }, [router]);

  const filteredHistory = history.filter(
    (entry) =>
      entry.date.toLowerCase().includes(search.toLowerCase()) ||
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.amount.toString().includes(search)
  );

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / entriesPerPage);

  const handleExport = () => {
    const csvContent = [
      "Date,Amount,Description",
      ...history.map((entry) => `${entry.date},${entry.amount},${entry.description}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "earnings_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: history.map((entry) => entry.date),
    datasets: [
      {
        label: "Earnings Over Time",
        data: history.map((entry) => entry.amount),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Earnings Trend" },
    },
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <div className="font-sans min-h-screen flex flex-col bg-gray-100">
        <InstructorHeader fullName={auth.currentUser?.displayName || "Instructor"} />
        <main className="flex-1 pt-24 px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Earnings History</h1>
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg space-y-6">
            {/* Search Bar */}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              placeholder="Search by date, amount, or description..."
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
            />

            {/* Chart */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Earnings Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border">Amount</th>
                    <th className="py-2 px-4 border">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-2 px-4 text-center text-gray-500">
                        No earnings found.
                      </td>
                    </tr>
                  ) : (
                    paginatedHistory.map((entry, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border">{entry.date}</td>
                        <td className="py-2 px-4 border">${entry.amount}</td>
                        <td className="py-2 px-4 border">{entry.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Export to CSV
            </button>

            {/* Back Button */}
            <button
              onClick={() => router.push("/instructor/earnings-details")}
              className="w-full py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Earnings Details
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}