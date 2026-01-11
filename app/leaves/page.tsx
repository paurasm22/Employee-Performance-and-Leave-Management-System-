"use client";
import { useEffect, useState } from "react";

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
  managers: string[];
}

export default function ManagerLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [comment, setComment] = useState("");

  const managerId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const loadLeaves = () => {
    if (!managerId) return;

    fetch(`/api/leaves/by-manager?managerId=${managerId}`)
      .then((res) => res.json())
      .then(setLeaves);
  };

  useEffect(() => {
    loadLeaves();
  }, [managerId]);

 const vote = async (
  leaveId: string,
  decision: "approved" | "rejected"
) => {
  const res = await fetch("/api/leaves/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leaveId,
      managerId,
      decision,
      comment,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  setComment("");
  loadLeaves();
};

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "tie") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Leave Requests
      </h1>

      {leaves.length === 0 && (
        <p className="text-gray-500">No leave requests.</p>
      )}

      <div className="space-y-4">
        {leaves.map((l) => {
          const approvals = l.votes.filter(
            (v) => v.decision === "approve"
          ).length;

          const rejects = l.votes.filter(
            (v) => v.decision === "reject"
          ).length;

          const totalManagers = l.managers.length;
          const pendingVotes =
            totalManagers - (approvals + rejects);

          const isFinal =
            l.status === "approved" ||
            l.status === "rejected" ||
            l.status === "tie";

          return (
            <div
              key={l._id}
              className="border p-4 rounded bg-white shadow"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {l.employee.name} ({l.employee.empNumber})
                  </p>

                  <p className="text-sm">
                    {new Date(l.fromDate).toLocaleDateString()} →{" "}
                    {new Date(l.toDate).toLocaleDateString()}
                  </p>

                  <p className="text-sm capitalize">
                    Type: {l.leaveType}
                  </p>

                  {l.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      {l.reason}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded text-sm h-fit ${statusColor(
                    l.status
                  )}`}
                >
                  {l.status}
                </span>
              </div>

              {/* VOTE SUMMARY */}
              <div className="mt-3 text-sm">
                <p>
                  ✅ Approvals: {approvals} / {totalManagers}
                </p>
                <p>
                  ❌ Rejects: {rejects} / {totalManagers}
                </p>
                <p>
                  ⏳ Waiting: {pendingVotes}
                </p>
              </div>

              {/* INDIVIDUAL VOTES */}
              {l.votes.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-medium">Votes:</p>

                  {l.votes.map((v, i) => (
                    <p key={i}>
                      {v.manager.name} ({v.manager.empNumber}) →{" "}
                      <b>{v.decision}</b>
                      {v.comment && ` — ${v.comment}`}
                    </p>
                  ))}
                </div>
              )}

              {/* ACTIONS */}
              {!isFinal && (
                <div className="mt-4">
                  <textarea
                    placeholder="Optional comment"
                    className="border p-2 w-full mb-2"
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                       vote(l._id, "approved")
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                       vote(l._id, "rejected")
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* HR ESCALATION */}
              {l.status === "tie" && (
                <p className="mt-3 text-yellow-700 text-sm">
                  ⚠ This request is tied and has been escalated to HR.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
