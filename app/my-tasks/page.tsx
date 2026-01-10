"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  project: Project;
  assignedTo: User[];
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (!employeeId) return;

    fetch(`/api/tasks/by-employee?employeeId=${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, [employeeId]);

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

      {tasks.length === 0 && (
        <p className="text-gray-500">No tasks assigned yet.</p>
      )}

     {tasks.map((task) => (
  <div
    key={task._id}
    className="border p-4 rounded mb-3 bg-white shadow-sm flex justify-between items-center"
  >
    <div>
      <h3 className="font-semibold text-lg">{task.title}</h3>

      <p className="text-sm text-gray-600">
        {task.description}
      </p>

      <p className="text-sm mt-1">
        Project: <b>{task.project.name}</b>
      </p>

      <p className="text-sm">
        Deadline:{" "}
        <b>{new Date(task.deadline).toLocaleDateString()}</b>
      </p>
    </div>

    <Link
      href={`/my-tasks/${task._id}`}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      View Progress
    </Link>
  </div>
))}

    </div>
  );
}
