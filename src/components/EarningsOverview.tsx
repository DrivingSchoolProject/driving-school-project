"use client";

import React from "react";
import { useRouter } from "next/navigation";

const EarningsOverview: React.FC = () => {
  const router = useRouter();
  const earnings = {
    weekly: 500,
    monthly: 2000,
    allTime: 15000,
    pending: 100,
  };

  return (
    <div
      className="p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 transition"
      onClick={() => router.push("/instructor/earnings-details")}
    >
      <h2 className="text-xl font-semibold mb-4">Earnings Overview</h2>
      <div className="space-y-2">
        <p>Weekly: ${earnings.weekly}</p>
        <p>Monthly: ${earnings.monthly}</p>
        <p>All-Time Deposits: ${earnings.allTime}</p>
        <p>Pending: ${earnings.pending}</p>
      </div>
    </div>
  );
};

export default EarningsOverview;