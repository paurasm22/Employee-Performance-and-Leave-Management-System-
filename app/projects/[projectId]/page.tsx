"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  status: string;
}

interface Project {
  _id: string;
  name: string;
  employees: User[];
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortDuration, setSortDuration] = useState("none");

  // Task form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // Assignment dropdown
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<User[]>([]);

  /* ================= FETCH PROJECT ================= */
  useEffect(() => {
    fetch("/api/projects/list")
      .then((res) => res.json())
      .then((projects) => {
        const p = projects.find((p: Project) => p._id === projectId);
        setProject(p);
      });
  }, [projectId]);

  /* ================= FETCH TASKS ================= */
  const loadTasks = () => {
    fetch(`/api/tasks/by-project?projectId=${projectId}`)
      .then((res) => res.json())
      .then(setTasks);
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  /* ================= FILTER LOGIC ================= */
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    const now = new Date().getTime();

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (timeFilter === "due-soon") {
      filtered = filtered.filter(
        (t) =>
          new Date(t.deadline).getTime() - now <=
            3 * 24 * 60 * 60 * 1000 &&
          new Date(t.deadline).getTime() >= now
      );
    }

    if (timeFilter === "overdue") {
      filtered = filtered.filter(
        (t) => new Date(t.deadline).getTime() < now
      );
    }

    if (sortDuration === "shortest") {
      filtered.sort(
        (a, b) =>
          new Date(a.deadline).getTime() -
          new Date(b.deadline).getTime()
      );
    }

    if (sortDuration === "longest") {
      filtered.sort(
        (a, b) =>
          new Date(b.deadline).getTime() -
          new Date(a.deadline).getTime()
      );
    }

    return filtered;
  };

  /* ================= SEARCH EMPLOYEES ================= */
  const searchEmployees = (q: string) => {
    setQuery(q);

    if (!project || !q) {
      setResults([]);
      return;
    }

    const filtered = project.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.empNumber.toLowerCase().includes(q.toLowerCase())
    );

    setResults(filtered);
  };

  const addEmployee = (emp: User) => {
    if (!assignedEmployees.find((e) => e._id === emp._id)) {
      setAssignedEmployees([...assignedEmployees, emp]);
    }
    setQuery("");
    setResults([]);
  };

  const removeEmployee = (id: string) => {
    setAssignedEmployees((prev) =>
      prev.filter((e) => e._id !== id)
    );
  };

  /* ================= CREATE TASK ================= */
  const createTask = async () => {
    if (!title || !deadline || assignedEmployees.length === 0) {
      alert("Fill all required fields");
      return;
    }

    await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        deadline,
        projectId,
        assignedTo: assignedEmployees.map((e) => e._id),
      }),
    });

    alert("Task created successfully");

    setTitle("");
    setDescription("");
    setDeadline("");
    setAssignedEmployees([]);
    setActiveTab("list");
    loadTasks();
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded ${
            activeTab === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          📋 Task List
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 rounded ${
            activeTab === "create"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          ➕ Assign Task
        </button>
      </div>

      {/* ================= TASK LIST ================= */}
      {activeTab === "list" && (
        <div>
          {/* FILTER BAR */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              className="border p-2 rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="border p-2 rounded"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Deadlines</option>
              <option value="due-soon">Due Soon (3 days)</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              className="border p-2 rounded"
              value={sortDuration}
              onChange={(e) => setSortDuration(e.target.value)}
            >
              <option value="none">Sort by</option>
              <option value="shortest">Shortest Deadline</option>
              <option value="longest">Longest Deadline</option>
            </select>
          </div>

          {getFilteredTasks().length === 0 && (
            <p className="text-sm text-gray-500">
              No tasks found.
            </p>
          )}

          {getFilteredTasks().map((t) => (
            <div
              key={t._id}
              className="border p-4 rounded mb-3 bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{t.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      t.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : t.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {t.description}
                </p>

                <p className="text-sm mt-1">
                  Assigned to:{" "}
                  <b>
                    {t.assignedTo
                      .map(
                        (e) => `${e.name} (${e.empNumber})`
                      )
                      .join(", ")}
                  </b>
                </p>

                <p className="text-sm">
                  Deadline:{" "}
                  <b>
                    {new Date(t.deadline).toLocaleDateString()}
                  </b>
                </p>
              </div>

              <Link
                href={`/tasks/${t._id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                View Progress
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ================= CREATE TASK ================= */}
      {activeTab === "create" && (
        <div className="bg-white p-5 rounded shadow">
          <input
            className="border p-2 w-full mb-3"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">
            Deadline
          </label>
          <input
            type="date"
            className="border p-2 w-full mb-4"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">
            Assign Employees
          </label>

          <div className="relative mb-2">
            <input
              className="border p-2 w-full rounded"
              placeholder="Search and select employees"
              value={query}
              onChange={(e) => searchEmployees(e.target.value)}
              onFocus={() => searchEmployees(query)}
            />

            {results.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded shadow max-h-40 overflow-y-auto">
                {results.map((e) => (
                  <div
                    key={e._id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => addEmployee(e)}
                  >
                    {e.name} ({e.empNumber})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {assignedEmployees.map((e) => (
              <span
                key={e._id}
                className="bg-blue-100 px-2 py-1 rounded text-sm cursor-pointer"
                onClick={() => removeEmployee(e._id)}
              >
                {e.empNumber} ✕
              </span>
            ))}
          </div>

          <button
            onClick={createTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Task
          </button>
        </div>
      )}
    </div>
  );
}
