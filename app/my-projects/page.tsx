"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

interface Project {
  _id: string;
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  managers: User[];
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (!employeeId) return;

    fetch(`/api/projects/by-employee?employeeId=${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, [employeeId]);

  const getDuration = (start: string, end: string) => {
    return Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  if (loading) return <p className="p-6">Loading projects...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Projects</h1>

      {projects.length === 0 && (
        <p className="text-gray-500">
          You are not assigned to any projects yet.
        </p>
      )}

      <div className="grid gap-4">
        {projects.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg p-4 shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-bold">{p.name}</h2>

              <p className="text-sm text-gray-600">
                Department: {p.department}
              </p>

              <p className="text-sm">
                Duration:{" "}
                <b>
                  {getDuration(p.startDate, p.endDate)} days
                </b>
              </p>

              <p className="text-sm">
                Manager(s):{" "}
                <b>
                  {p.managers.map((m) => m.name).join(", ")}
                </b>
              </p>
            </div>

            <Link
             href={`/my-projects/${p._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              View Tasks
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
