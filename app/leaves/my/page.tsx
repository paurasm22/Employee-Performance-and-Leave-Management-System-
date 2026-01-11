"use client";
import { useEffect, useState } from "react";

interface Vote {
  manager?: {
    name?: string;
    empNumber?: string;
  };
  decision: "approved" | "rejected";
  comment?: string;
  decidedAt?: string;
}

interface Leave {
  _id: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  status: "pending" | "approved" | "rejected" | "tie";
  reason?: string;
  votes: Vote[];
  resolvedByHR?: boolean;
  hrDecision?: "approved" | "rejected";
  hrDecidedAt?: string;
}

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (!employeeId) return;

    fetch(`/api/leaves/by-employee?employeeId=${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setLeaves(data);
        setLoading(false);
      });
  }, [employeeId]);

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "tie") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Leaves</h1>

      {leaves.length === 0 && (
        <p className="text-gray-500">No leave requests yet.</p>
      )}

      <div className="space-y-4">
        {leaves.map((l) => (
          <div
            key={l._id}
            className="border p-4 rounded bg-white shadow-sm"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <p className="font-medium capitalize">
                {l.leaveType} Leave
              </p>

              <span
                className={`px-2 py-1 rounded text-sm ${statusColor(
                  l.status
                )}`}
              >
                {l.status.toUpperCase()}
              </span>
            </div>

            <p className="text-sm mt-1">
              {new Date(l.fromDate).toLocaleDateString()} →{" "}
              {new Date(l.toDate).toLocaleDateString()}
            </p>

            {l.reason && (
              <p className="text-sm text-gray-600 mt-1">
                {l.reason}
              </p>
            )}

            {/* TIMELINE */}
            <div className="mt-3 border-t pt-3">
              <p className="font-semibold text-sm mb-2">
                Approval Timeline
              </p>

              {/* MANAGER VOTES */}
              {l.votes.length > 0 ? (
                <div className="space-y-1">
                  {l.votes.map((v, i) => (
                    <div
                      key={i}
                      className="text-sm flex items-center gap-2"
                    >
                      <span>👤</span>
                      <span>
                        {v.manager?.name || "Manager"}{" "}
                        {v.manager?.empNumber
                          ? `(${v.manager.empNumber})`
                          : ""}
                      </span>
                      <span>→</span>
                      <b
                        className={
                          v.decision === "approved"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {v.decision.toUpperCase()}
                      </b>
                      {v.comment && (
                        <span className="text-gray-500">
                          — {v.comment}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Waiting for manager responses...
                </p>
              )}

              {/* HR FINAL DECISION */}
              {l.resolvedByHR && l.hrDecision && (
                <div className="mt-3 text-sm flex items-center gap-2">
                  <span>🏢</span>
                  <span>HR Final Decision:</span>
                  <b
                    className={
                      l.hrDecision === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {l.hrDecision.toUpperCase()}
                  </b>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
