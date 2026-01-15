"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { menuByRole } from "@/lib/menu";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { role, setRole } = useAuth();

  const [mounted, setMounted] = useState(false);

  // Wait until browser hydration completes
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 Prevent hydration mismatch
  if (!mounted) {
    return <div className="h-14 bg-gray-900" />;
  }

  if (!role) return null;

  const menu = menuByRole[role];

  const logout = () => {
    localStorage.clear();
    setRole(null);
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-3">
      <div className="font-bold text-lg">Employee System</div>

      <div className="flex gap-4">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="hover:text-blue-400"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
}
