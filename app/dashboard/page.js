"use client";

export default function Dashboard() {
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const name =
    typeof window !== "undefined" ? localStorage.getItem("name") : null;

  const empNumber =
    typeof window !== "undefined" ? localStorage.getItem("empNumber") : null;

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded shadow max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Welcome, {name} 👋</h1>

        <p className="text-gray-600">
          Employee ID: <b>{empNumber}</b>
        </p>

        <p className="text-gray-600">
          Role: <b className="capitalize">{role}</b>
        </p>
      </div>
    </div>
  );
}
