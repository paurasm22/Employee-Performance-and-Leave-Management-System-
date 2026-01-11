"use client";
import { useState } from "react";

export default function ApplyLeavePage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [reason, setReason] = useState("");

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const submitLeave = async () => {
    if (!fromDate || !toDate) {
      alert("Please select dates");
      return;
    }

    const res = await fetch("/api/leaves/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        fromDate,
        toDate,
        leaveType,
        reason,
      }),
    });

    if (res.ok) {
      alert("Leave request submitted");
      setFromDate("");
      setToDate("");
      setReason("");
    } else {
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Apply for Leave</h1>

      <div className="bg-white p-4 rounded shadow">
        <label className="block mb-1">From Date</label>
        <input
          type="date"
          className="border p-2 w-full mb-3"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <label className="block mb-1">To Date</label>
        <input
          type="date"
          className="border p-2 w-full mb-3"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <label className="block mb-1">Leave Type</label>
        <select
          className="border p-2 w-full mb-3"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
        >
          <option value="casual">Casual</option>
          <option value="sick">Sick</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <label className="block mb-1">Reason</label>
        <textarea
          className="border p-2 w-full mb-4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button
          onClick={submitLeave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Leave
        </button>
      </div>
    </div>
  );
}
