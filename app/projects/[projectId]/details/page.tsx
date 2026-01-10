"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  department: string;
  startDate: string;
  endDate: string;
  managers: User[];
  employees: User[];
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/api/projects/list")
      .then((res) => res.json())
      .then((projects) => {
        const found = projects.find(
          (p: Project) => p._id === projectId
        );
        setProject(found);
      });
  }, [projectId]);

  if (!project) return <p className="p-6">Loading...</p>;

  const getDuration = (start: string, end: string) => {
    return Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">
          {project.name}
        </h1>

        <p className="text-gray-600 mb-4">
          {project.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <p>
            <b>Department:</b> {project.department}
          </p>

          <p>
            <b>Start Date:</b>{" "}
            {new Date(project.startDate).toLocaleDateString()}
          </p>

          <p>
            <b>End Date:</b>{" "}
            {new Date(project.endDate).toLocaleDateString()}
          </p>

          <p>
            <b>Duration:</b>{" "}
            {getDuration(
              project.startDate,
              project.endDate
            )}{" "}
            days
          </p>
        </div>

        {/* Managers */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Managers</h2>
          {project.managers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No managers assigned.
            </p>
          ) : (
            <ul className="list-disc ml-5 text-sm">
              {project.managers.map((m) => (
                <li key={m._id}>
                  {m.name} ({m.empNumber})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Employees */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Employees</h2>
          {project.employees.length === 0 ? (
            <p className="text-sm text-gray-500">
              No employees assigned.
            </p>
          ) : (
            <ul className="list-disc ml-5 text-sm">
              {project.employees.map((e) => (
                <li key={e._id}>
                  {e.name} ({e.empNumber})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Link
            href={`/projects/${project._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            View Tasks
          </Link>

          <Link
            href="/projects"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
