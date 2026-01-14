"use client";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type TaskStatus = "pending" | "in-progress" | "completed";

interface Employee {
  name: string;
  empNumber: string;
}

interface Project {
  name: string;
}

interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  deadline: string;
  assignedTo?: Employee;
  project?: Project;
}

/* ================= PAGE ================= */

export default function ManagerTaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userId");
  });

  useEffect(() => {
    if (!userId) return;

    // Change this endpoint if your backend differs
    const url = `/api/performance/by-manager?managerId=${userId}`;

    fetch(url)
      .then((res) => res.json())
      .then((resData: unknown) => {
        if (Array.isArray(resData)) {
          setTasks(resData as Task[]);
        } else if (
          typeof resData === "object" &&
          resData !== null &&
          "tasks" in resData &&
          Array.isArray((resData as { tasks: unknown }).tasks)
        ) {
          setTasks((resData as { tasks: Task[] }).tasks);
        } else {
          setTasks([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Team Tasks</h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Tasks" value={tasks.length} />
        <Card
          title="Completed"
          value={tasks.filter((t) => t.status === "completed").length}
        />
        <Card
          title="Pending"
          value={tasks.filter((t) => t.status !== "completed").length}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th>Status</th>
              <th>Employee</th>
              <th>Project</th>
              <th>Deadline</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-4 text-gray-400"
                >
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="p-2">{t.title}</td>

                  <td className="capitalize">{t.status}</td>

                  <td>
                    {t.assignedTo
                      ? `${t.assignedTo.name} (${t.assignedTo.empNumber})`
                      : "Unassigned"}
                  </td>

                  <td>{t.project?.name ?? "-"}</td>

                  <td>
                    {new Date(t.deadline).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

interface CardProps {
  title: string;
  value: number;
}

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
