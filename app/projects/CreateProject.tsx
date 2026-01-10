"use client";
import { useState } from "react";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("IT");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [managerQuery, setManagerQuery] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");

  const [managerResults, setManagerResults] = useState<User[]>([]);
  const [employeeResults, setEmployeeResults] = useState<User[]>([]);

  const [managers, setManagers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);

  /* 🔍 Search users */
  const searchUsers = async (
    q: string,
    role: "manager" | "employee",
    setter: React.Dispatch<React.SetStateAction<User[]>>
  ) => {
    if (!q) {
      setter([]);
      return;
    }
    const res = await fetch(`/api/users/search?q=${q}&role=${role}`);
    const data: User[] = await res.json();
    setter(data);
  };

  /* ➕ Add user (prevent duplicates) */
  const addUser = (
    user: User,
    list: User[],
    setter: React.Dispatch<React.SetStateAction<User[]>>
  ) => {
    if (!list.find((u) => u._id === user._id)) {
      setter([...list, user]);
    }
  };

  /* ❌ Remove user */
  const removeUser = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<User[]>>
  ) => {
    setter((prev) => prev.filter((u) => u._id !== id));
  };

  /* ⏱️ Duration calculation */
  const duration =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() -
            new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  /* 🚀 Submit */
  const submit = async () => {
    if (!name || !startDate || !endDate) {
      alert("Please fill required fields");
      return;
    }

    await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        department,
        startDate,
        endDate,
        managers: managers.map((m) => m._id),
        employees: employees.map((e) => e._id),
      }),
    });

    alert("Project created successfully!");
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setManagers([]);
    setEmployees([]);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Project</h2>

      {/* Project Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Project Name
          </label>
          <input
            className="border w-full p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Alpha"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            className="border w-full p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short project description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Department
          </label>
          <select
            className="border w-full p-2 rounded"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>IT</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Operations</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="border w-full p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            End Date
          </label>
          <input
            type="date"
            className="border w-full p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {duration && duration > 0 && (
        <p className="mt-2 text-sm text-gray-600">
          ⏱️ Duration: <b>{duration} days</b>
        </p>
      )}

      {/* Managers */}
      <div className="mt-6">
        <label className="block font-medium mb-1">Managers</label>
        <input
          className="border w-full p-2 rounded"
          placeholder="Search managers"
          value={managerQuery}
          onChange={(e) => {
            setManagerQuery(e.target.value);
            searchUsers(e.target.value, "manager", setManagerResults);
          }}
        />

        {managerResults.map((m) => (
          <div
            key={m._id}
            className="p-2 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              addUser(m, managers, setManagers);
              setManagerQuery("");
              setManagerResults([]);
            }}
          >
            {m.name} ({m.empNumber})
          </div>
        ))}

        <div className="flex gap-2 flex-wrap mt-2">
          {managers.map((m) => (
            <span
              key={m._id}
              className="bg-blue-100 px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => removeUser(m._id, setManagers)}
            >
              {m.empNumber} ✕
            </span>
          ))}
        </div>
      </div>

      {/* Employees */}
      <div className="mt-6">
        <label className="block font-medium mb-1">Employees</label>
        <input
          className="border w-full p-2 rounded"
          placeholder="Search employees"
          value={employeeQuery}
          onChange={(e) => {
            setEmployeeQuery(e.target.value);
            searchUsers(e.target.value, "employee", setEmployeeResults);
          }}
        />

        {employeeResults.map((e) => (
          <div
            key={e._id}
            className="p-2 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              addUser(e, employees, setEmployees);
              setEmployeeQuery("");
              setEmployeeResults([]);
            }}
          >
            {e.name} ({e.empNumber})
          </div>
        ))}

        <div className="flex gap-2 flex-wrap mt-2">
          {employees.map((e) => (
            <span
              key={e._id}
              className="bg-green-100 px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => removeUser(e._id, setEmployees)}
            >
              {e.empNumber} ✕
            </span>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-lg"
      >
        Create Project
      </button>
    </div>
  );
}
