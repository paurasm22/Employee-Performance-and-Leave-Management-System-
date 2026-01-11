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
}

export default function HRLeaveResolutionPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);

  const loadLeaves = () => {
    fetch("/api/leaves/tie")
      .then((res) => res.json())
      .then(setLeaves);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

 const resolve = async (
  leaveId: string,
  decision: "approved" | "rejected"
) => {
  const res = await fetch("/api/leaves/hr-decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leaveId,
      decision,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Something went wrong");
    return;
  }

  alert("Decision saved!");
  loadLeaves();
};
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        HR – Tie Resolution
      </h1>

      {leaves.length === 0 && (
        <p className="text-gray-500">
          No tied leave requests.
        </p>
      )}

      <div className="space-y-4">
        {leaves.map((l) => (
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

              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm h-fit">
                TIE
              </span>
            </div>

            {/* VOTES */}
            <div className="mt-3 text-sm">
              <p className="font-medium">Manager Votes:</p>

              {l.votes.map((v, i) => (
                <p key={i}>
                  {v.manager.name} ({v.manager.empNumber}) →{" "}
                  <b>{v.decision}</b>
                  {v.comment && ` — ${v.comment}`}
                </p>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() =>
                  resolve(l._id, "approved")
                }
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  resolve(l._id, "rejected")
                }
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
