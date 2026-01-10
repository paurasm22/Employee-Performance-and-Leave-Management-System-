"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  managers: any[];
  employees: any[];
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

  useEffect(() => {
    fetch("/api/projects/list")
      .then((res) => res.json())
      .then(setProjects);
  }, []);

  const getDuration = (start: string, end: string) => {
    return Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const getDaysRemaining = (end: string) => {
    const today = new Date().getTime();
    const deadline = new Date(end).getTime();
    const diff = Math.ceil(
      (deadline - today) / (1000 * 60 * 60 * 24)
    );

    if (diff < 0) return "Overdue";
    if (diff === 0) return "Due Today";
    return `${diff} days left`;
  };

  return (
    <div className="grid gap-4">
      {projects.map((p) => {
        const remaining = getDaysRemaining(p.endDate);

        return (
          <div
            key={p._id}
            onClick={() =>
              router.push(`/projects/${p._id}/details`)
            }
            className="border rounded-lg p-4 shadow-sm bg-white flex justify-between items-center hover:shadow-md transition cursor-pointer"
          >
            {/* LEFT INFO */}
            <div>
              <h2 className="text-lg font-bold">{p.name}</h2>

              <p className="text-sm text-gray-600">
                Department: {p.department}
              </p>

              <p className="text-sm">
                Duration:{" "}
                <b>{getDuration(p.startDate, p.endDate)} days</b>
              </p>

              <p className="text-sm">
                Deadline:{" "}
                <b>
                  {new Date(p.endDate).toLocaleDateString()}
                </b>
              </p>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm">
                  Managers: {p.managers.length}
                </span>
                <span className="text-sm">
                  Employees: {p.employees.length}
                </span>

                {/* DAYS REMAINING BADGE */}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    remaining === "Overdue"
                      ? "bg-red-100 text-red-700"
                      : remaining === "Due Today"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {remaining}
                </span>
              </div>
            </div>

            {/* RIGHT ACTION */}
            <div onClick={(e) => e.stopPropagation()}>
              {role === "manager" && (
                <Link
                  href={`/projects/${p._id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Manage
                </Link>
              )}

              {role === "hr" && (
                <Link
                  href={`/projects/${p._id}/details`}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  View
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
