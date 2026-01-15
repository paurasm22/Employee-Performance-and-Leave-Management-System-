"use client";
import { useState,useEffect } from "react";
import CreateProject from "./CreateProject";
import ProjectList from "./ProjectList";

export default function ProjectsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create">("list");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     setMounted(true);
     setRole(localStorage.getItem("role"));
  }, []);

  if (!mounted) return null; 
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        {role === "hr" && (
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Project List
            </button>

            <button
              onClick={() => setView("create")}
              className={`px-4 py-2 rounded ${
                view === "create"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              + Create Project
            </button>
          </div>
        )}
      </div>

      {view === "list" && <ProjectList />}
      {view === "create" && role === "hr" && <CreateProject />}
    </div>
  );
}
