"use client";
import { useEffect, useState } from "react";

interface Performance {
  _id: string;
  rating: string;
  comment: string;
  createdAt: string;
  task: {
    title: string;
  };
  project: {
    name: string;
  };
  reviewedBy: {
    name: string;
  };
}

export default function MyPerformancePage() {
  const [reviews, setReviews] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (!employeeId) return;

    fetch(`/api/performance/by-employee?employeeId=${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      });
  }, [employeeId]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Performance</h1>

      {reviews.length === 0 && (
        <p className="text-gray-500">
          No performance reviews yet.
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="border p-4 rounded bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">{r.task.title}</h2>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  r.rating === "Excellent"
                    ? "bg-green-100 text-green-700"
                    : r.rating === "Good"
                    ? "bg-blue-100 text-blue-700"
                    : r.rating === "Satisfactory"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r.rating}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              Project: <b>{r.project.name}</b>
            </p>

            <p className="text-sm mt-2">
              <b>Manager Feedback:</b> {r.comment}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Reviewed by {r.reviewedBy.name} on{" "}
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
