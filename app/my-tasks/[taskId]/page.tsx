"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ProgressUpdate {
  _id: string;
  comment: string;
  managerReply: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
}

export default function EmployeeTaskProgressPage() {
  const { taskId } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [newComment, setNewComment] = useState("");

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  /* ================= LOAD TASK ================= */
  useEffect(() => {
    fetch(`/api/tasks/by-id?taskId=${taskId}`)
      .then((res) => res.json())
      .then(setTask);
  }, [taskId]);

  /* ================= LOAD UPDATES ================= */
  const loadUpdates = () => {
    if (!employeeId) return;

    fetch(
      `/api/progress/by-task?taskId=${taskId}&employeeId=${employeeId}`
    )
      .then((res) => res.json())
      .then(setUpdates);
  };

  useEffect(() => {
    loadUpdates();
  }, [taskId, employeeId]);

  /* ================= ADD UPDATE ================= */
  const submitUpdate = async () => {
    if (!newComment.trim()) {
      alert("Please write an update");
      return;
    }

    await fetch("/api/progress/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        employeeId,
        comment: newComment,
      }),
    });

    setNewComment("");
    loadUpdates();
  };

  if (!task) return <p className="p-6">Loading task...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* TASK INFO */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <p className="text-sm text-gray-600">{task.description}</p>

        <div className="flex gap-6 mt-2 text-sm">
          <p>
            Status: <b>{task.status}</b>
          </p>
          <p>
            Deadline:{" "}
            <b>
              {new Date(task.deadline).toLocaleDateString()}
            </b>
          </p>
        </div>
      </div>

      {/* UPDATES */}
      <h2 className="text-xl font-semibold mb-3">
        My Progress Updates
      </h2>

      {updates.length === 0 && (
        <p className="text-sm text-gray-500">
          No updates yet.
        </p>
      )}

      <div className="space-y-4">
        {updates.map((u) => (
          <div
            key={u._id}
            className="border p-4 rounded bg-white shadow-sm"
          >
            <p className="text-sm">{u.comment}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(u.createdAt).toLocaleString()}
            </p>

            {u.managerReply && (
              <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                <b>Manager:</b> {u.managerReply}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD UPDATE */}
      <div className="mt-8 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">
          Add New Update
        </h3>

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="What did you work on today?"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <button
          onClick={submitUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Submit Update
        </button>
      </div>
    </div>
  );
}
