"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const params = useParams();
  const router = useRouter();

  const projectId =
    typeof params.projectId === "string"
      ? params.projectId
      : params.projectId?.[0];

  const [project, setProject] = useState<Project | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  const loadProject = async () => {
    const res = await fetch("/api/projects/list");
    const projects = await res.json();

    const found = projects.find((p: Project) => p._id === projectId);
    setProject(found);
  };

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  if (!project) return <p className="p-6">Loading...</p>;

  const getDuration = (start: string, end: string) => {
    return Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  /* ================= REMOVE MANAGER ================= */
  const removeManager = async (managerId: string) => {
    await fetch("/api/projects/remove-manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        managerId,
      }),
    });

    loadProject();
  };

  /* ================= REMOVE EMPLOYEE ================= */
  const removeEmployee = async (employeeId: string) => {
    await fetch("/api/projects/remove-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        employeeId,
      }),
    });

    loadProject();
  };

  /* ================= DELETE PROJECT ================= */
  const deleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    await fetch("/api/projects/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });

    alert("Project deleted");
    router.push("/projects");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>

        <p className="text-gray-600 mb-4">
          {project.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><b>Department:</b> {project.department}</p>
          <p><b>Start Date:</b> {new Date(project.startDate).toLocaleDateString()}</p>
          <p><b>End Date:</b> {new Date(project.endDate).toLocaleDateString()}</p>
          <p><b>Duration:</b> {getDuration(project.startDate, project.endDate)} days</p>
        </div>

        {/* MANAGERS */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Managers</h2>

          {project.managers.map((m) => (
            <div key={m._id} className="flex justify-between items-center border p-2 rounded mb-2">
              <span>{m.name} ({m.empNumber})</span>

              {role === "hr" && (
                <button
                  onClick={() => removeManager(m._id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {project.managers.length === 0 && (
            <p className="text-sm text-gray-500">No managers assigned.</p>
          )}
        </div>

        {/* EMPLOYEES */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Employees</h2>

          {project.employees.map((e) => (
            <div key={e._id} className="flex justify-between items-center border p-2 rounded mb-2">
              <span>{e.name} ({e.empNumber})</span>

              {role === "hr" && (
                <button
                  onClick={() => removeEmployee(e._id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {project.employees.length === 0 && (
            <p className="text-sm text-gray-500">No employees assigned.</p>
          )}
        </div>

        {/* ACTIONS */}
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

          {role === "hr" && (
            <button
              onClick={deleteProject}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Delete Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
