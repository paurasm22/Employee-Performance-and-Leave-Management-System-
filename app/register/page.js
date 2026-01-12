"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    empNumber: "",
    name: "",
    password: "",
    role: "employee",
    department: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("User registered successfully");
      router.push("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded w-96 shadow">
        <h2 className="text-xl font-bold mb-4">Register User</h2>

        <input
          name="empNumber"
          placeholder="Employee ID"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <input
          name="name"
          placeholder="Full Name"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <select
          name="role"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="hr">HR</option>
        </select>

        <input
          name="department"
          placeholder="Department"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <button
          onClick={handleRegister}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}
