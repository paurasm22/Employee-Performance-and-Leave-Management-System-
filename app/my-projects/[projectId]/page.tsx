"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  assignedTo: User[];
  project: {
    _id: string;
    name: string;
  };
}

export default function MyProjectTasksPage() {
  const { projectId } = useParams();
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
      .then((data: Task[]) => {
        // Filter tasks for this project only
        const filtered = data.filter(
          (task) => task.project._id === projectId
        );
        setTasks(filtered);
        setLoading(false);
      });
  }, [employeeId, projectId]);

  if (loading) return <p className="p-6">Loading tasks...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>

      {tasks.length === 0 && (
        <p className="text-gray-500">
          No tasks assigned for this project.
        </p>
      )}

      {tasks.map((task) => (
        <div
          key={task._id}
          className="border p-4 rounded mb-3 bg-white shadow-sm"
        >
          <h3 className="font-semibold text-lg">
            {task.title}
          </h3>

          <p className="text-sm text-gray-600">
            {task.description}
          </p>

          <p className="text-sm mt-1">
            Deadline:{" "}
            <b>
              {new Date(task.deadline).toLocaleDateString()}
            </b>
          </p>
        </div>
      ))}
    </div>
  );
}
