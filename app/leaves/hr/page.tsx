"use client";
import { useEffect, useMemo, useState } from "react";

interface Vote {
  manager: {
    name: string;
    empNumber: string;
  };
  decision: string;
  comment?: string;
}

interface Leave {
  _id: string;
  employee: {
    name: string;
    empNumber: string;
  };
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
  status: string;
  votes: Vote[];
}

export default function HRLeaveResolutionPage() {
  const [activeTab, setActiveTab] = useState<"tie" | "history">("tie");

  const [tieLeaves, setTieLeaves] = useState<Leave[]>([]);
  const [historyLeaves, setHistoryLeaves] = useState<Leave[]>([]);

  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ================= LOAD DATA ================= */

  const loadTieLeaves = () => {
    fetch("/api/leaves/tie")
      .then((res) => res.json())
      .then(setTieLeaves);
  };

  const loadHistoryLeaves = () => {
    fetch("/api/leaves/hr-history")
      .then((res) => res.json())
      .then(setHistoryLeaves);
  };

  useEffect(() => {
    loadTieLeaves();
    loadHistoryLeaves();
  }, []);

  /* ================= FILTER LOGIC ================= */

  const filterLeaves = (leaves: Leave[]) => {
    return leaves.filter((l) => {
      const matchSearch =
        l.employee.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        l.employee.empNumber
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchType = leaveType
        ? l.leaveType === leaveType
        : true;

      const matchStatus = statusFilter
        ? l.status === statusFilter
        : true;

      return matchSearch && matchType && matchStatus;
    });
  };

  const filteredTieLeaves = useMemo(() => {
  return tieLeaves.filter((l) => {
    const matchSearch =
      l.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      l.employee.empNumber.toLowerCase().includes(search.toLowerCase());

    const matchType = leaveType ? l.leaveType === leaveType : true;
    const matchStatus = statusFilter ? l.status === statusFilter : true;

    return matchSearch && matchType && matchStatus;
  });
}, [tieLeaves, search, leaveType, statusFilter]);

const filteredHistoryLeaves = useMemo(() => {
  return historyLeaves.filter((l) => {
    const matchSearch =
      l.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      l.employee.empNumber.toLowerCase().includes(search.toLowerCase());

    const matchType = leaveType ? l.leaveType === leaveType : true;
    const matchStatus = statusFilter ? l.status === statusFilter : true;

    return matchSearch && matchType && matchStatus;
  });
}, [historyLeaves, search, leaveType, statusFilter]);
  /* ================= HR DECISION ================= */

  const resolve = async (
    leaveId: string,
    decision: "approved" | "rejected"
  ) => {
    const res = await fetch("/api/leaves/hr-decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveId, decision }),
    });

    if (!res.ok) {
      alert("Failed to save decision");
      return;
    }

    loadTieLeaves();
    loadHistoryLeaves();
  };

  /* ================= UI CARD ================= */

  const LeaveCard = ({
    leave,
    showActions,
  }: {
    leave: Leave;
    showActions: boolean;
  }) => (
    <div className="border p-4 rounded bg-white shadow">
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">
            {leave.employee.name} ({leave.employee.empNumber})
          </p>

          <p className="text-sm">
            {new Date(leave.fromDate).toLocaleDateString()} →{" "}
            {new Date(leave.toDate).toLocaleDateString()}
          </p>

          <p className="text-sm capitalize">
            Type: {leave.leaveType}
          </p>

          {leave.reason && (
            <p className="text-sm text-gray-600 mt-1">
              {leave.reason}
            </p>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded text-sm h-fit ${
            leave.status === "tie"
              ? "bg-yellow-100 text-yellow-700"
              : leave.status === "approved"
              ? "bg-green-100 text-green-700"
              : leave.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {leave.status.toUpperCase()}
        </span>
      </div>

      {/* VOTES */}
      <div className="mt-3 text-sm">
        <p className="font-medium">Manager Votes:</p>
        {leave.votes.map((v, i) => (
          <p key={i}>
            {v.manager.name} ({v.manager.empNumber}) →{" "}
            <b>{v.decision}</b>
            {v.comment && ` — ${v.comment}`}
          </p>
        ))}
      </div>

      {/* ACTIONS */}
      {showActions && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => resolve(leave._id, "approved")}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Approve
          </button>

          <button
            onClick={() => resolve(leave._id, "rejected")}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        HR – Leave Management
      </h1>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("tie")}
          className={`px-4 py-2 rounded ${
            activeTab === "tie"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Tie Requests
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded ${
            activeTab === "history"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          History
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          placeholder="Search employee"
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="sick">Sick</option>
          <option value="casual">Casual</option>
          <option value="earned">Earned</option>
        </select>

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="tie">Tie</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
        {activeTab === "tie" &&
          (filteredTieLeaves.length === 0 ? (
            <p className="text-gray-500">
              No tied leave requests.
            </p>
          ) : (
            filteredTieLeaves.map((l) => (
              <LeaveCard
                key={l._id}
                leave={l}
                showActions
              />
            ))
          ))}

        {activeTab === "history" &&
          (filteredHistoryLeaves.length === 0 ? (
            <p className="text-gray-500">
              No resolved leave history.
            </p>
          ) : (
            filteredHistoryLeaves.map((l) => (
              <LeaveCard
                key={l._id}
                leave={l}
                showActions={false}
              />
            ))
          ))}
      </div>
    </div>
  );
}
