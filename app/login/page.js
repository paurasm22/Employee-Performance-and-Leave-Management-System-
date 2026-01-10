"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
export default function LoginPage() {
  const [empNumber, setEmpNumber] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setRole } = useAuth();

  const handleLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ empNumber, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      setRole(data.role); // 🔥 THIS FIXES THE REFRESH ISSUE

      router.push("/dashboard");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          placeholder="Employee ID"
          className="border p-2 w-full mb-3"
          onChange={(e) => setEmpNumber(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
