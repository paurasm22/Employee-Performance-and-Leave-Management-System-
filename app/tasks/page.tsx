"use client";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type TaskStatus = "Not Started" | "In Progress" | "Completed";

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
  deadline?: string;
  assignedTo?: Employee[];
  project?: Project;
}

/* ================= PAGE ================= */

export default function ManagerTaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/tasks/by-manager?managerId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
        else if (Array.isArray(data.tasks)) setTasks(data.tasks);
        else setTasks([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="p-6">Loading tasks...</p>;

  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const pendingCount = tasks.filter(t => t.status !== "Completed").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Team Tasks</h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Tasks" value={tasks.length} />
        <Card title="Completed" value={completedCount} />
        <Card title="Pending" value={pendingCount} />
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
                <td colSpan={5} className="text-center p-4 text-gray-400">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="p-2">{t.title}</td>

                  <td className="capitalize">{t.status}</td>

                  <td>
                    {t.assignedTo && t.assignedTo.length > 0
                      ? `${t.assignedTo[0].name} (${t.assignedTo[0].empNumber})`
                      : "Unassigned"}
                  </td>

                  <td>{t.project?.name || "-"}</td>

                  <td>
                    {t.deadline
                      ? new Date(t.deadline).toLocaleDateString()
                      : "-"}
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
