"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

interface ProgressUpdate {
  _id: string;
  comment: string;
  managerReply: string;
  createdAt: string;
  employee: User;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  project: {
    _id: string;
    name: string;
  };
  assignedTo: User[];
}

export default function ManagerTaskProgressPage() {
  const { taskId } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [status, setStatus] = useState("");

  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [ratings, setRatings] = useState<{ [key: string]: string }>({});
  const [finalComments, setFinalComments] = useState<{ [key: string]: string }>({});

  /* ================= LOAD TASK ================= */
  useEffect(() => {
    fetch(`/api/tasks/by-id?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        setTask(data);
        setStatus(data.status);
      });
  }, [taskId]);

  /* ================= LOAD UPDATES ================= */
  const loadUpdates = () => {
    fetch(`/api/progress/by-task?taskId=${taskId}`)
      .then((res) => res.json())
      .then(setUpdates);
  };

  useEffect(() => {
    loadUpdates();
  }, [taskId]);

  /* ================= REPLY ================= */
  const sendReply = async (updateId: string) => {
    const reply = replyInputs[updateId];
    if (!reply) return;

    await fetch("/api/progress/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateId, reply }),
    });

    setReplyInputs((prev) => ({ ...prev, [updateId]: "" }));
    loadUpdates();
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async () => {
    await fetch("/api/tasks/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });

    alert("Status updated");
  };

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = async (employeeId: string) => {
    const rating = ratings[employeeId];
    const comment = finalComments[employeeId];
    const managerId = localStorage.getItem("userId");

    if (!rating || !comment) {
      alert("Select rating and write feedback");
      return;
    }

    await fetch("/api/performance/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        taskId,
        projectId: task?.project._id,
        rating,
        comment,
        reviewedBy: managerId,
      }),
    });

    alert("Performance review submitted");
  };

  if (!task) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* TASK INFO */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <p className="text-sm text-gray-600">{task.description}</p>

        <div className="flex gap-6 mt-2 items-center">
          <p className="text-sm">
            Deadline:{" "}
            <b>{new Date(task.deadline).toLocaleDateString()}</b>
          </p>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button
              onClick={updateStatus}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* UPDATES */}
      <h2 className="text-xl font-semibold mb-3">Employee Updates</h2>

      {updates.length === 0 && (
        <p className="text-gray-500 text-sm">No updates yet.</p>
      )}

      <div className="space-y-4">
        {updates.map((u) => (
          <div key={u._id} className="border p-4 rounded bg-white shadow-sm">
            <div className="text-sm font-medium">
              {u.employee.name} ({u.employee.empNumber})
            </div>

            <p className="text-sm mt-1">{u.comment}</p>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(u.createdAt).toLocaleString()}
            </p>

            {u.managerReply && (
              <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                <b>Manager:</b> {u.managerReply}
              </div>
            )}

            {/* REPLY */}
            <div className="mt-3 flex gap-2">
              <input
                className="border p-1 flex-1 rounded text-sm"
                placeholder="Write a reply..."
                value={replyInputs[u._id] || ""}
                onChange={(e) =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [u._id]: e.target.value,
                  }))
                }
              />

              <button
                onClick={() => sendReply(u._id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FINAL RATINGS — ONLY WHEN COMPLETED */}
      {status === "Completed" && task.assignedTo.length > 0 && (
        <div className="mt-10 bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            Final Performance Review
          </h2>

          {task.assignedTo.map((emp) => (
            <div
              key={emp._id}
              className="border p-4 rounded mb-4"
            >
              <p className="text-sm font-medium mb-1">
                {emp.name} ({emp.empNumber})
              </p>

              <select
                className="border p-2 rounded w-full mb-2"
                value={ratings[emp._id] || ""}
                onChange={(e) =>
                  setRatings((prev) => ({
                    ...prev,
                    [emp._id]: e.target.value,
                  }))
                }
              >
                <option value="">Select Rating</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>

              <textarea
                className="border p-2 w-full rounded mb-2"
                placeholder="Final feedback..."
                value={finalComments[emp._id] || ""}
                onChange={(e) =>
                  setFinalComments((prev) => ({
                    ...prev,
                    [emp._id]: e.target.value,
                  }))
                }
              />

              <button
                onClick={() => submitReview(emp._id)}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Submit Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
