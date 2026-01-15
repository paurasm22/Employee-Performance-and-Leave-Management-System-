"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center px-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center">
        
        {/* LEFT SIDE - TEXT */}
        <div className="text-white space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Employee Performance & <br />
            Leave Management System
          </h1>

          <p className="text-blue-100 text-lg">
            Track employee performance, manage tasks, handle leaves, and boost
            productivity — all in one smart platform.
          </p>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Get Started
            </Link>

            <Link
              href="/register"
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE - CARD */}
        <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            What you can do
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Feature title="📊 Performance Tracking" />
            <Feature title="📝 Task Management" />
            <Feature title="🗓 Leave Requests" />
            <Feature title="📈 Analytics & Reports" />
            <Feature title="👥 Team Management" />
            <Feature title="🔐 Role Based Access" />
          </div>

          <Link
            href="/login"
            className="block mt-8 text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Login to Dashboard
          </Link>

          <p className="text-xs text-gray-400 text-center mt-6">
            © {new Date().getFullYear()} Employee Management System
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 text-sm font-medium text-blue-800 shadow-sm">
      {title}
    </div>
  );
}