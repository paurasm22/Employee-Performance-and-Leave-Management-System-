import Link from "next/link";

export default function LandingPage() {
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-white px-6">
      
      {/* LOGO / TITLE */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
        Employee Performance & Leave Management
      </h1>

      <p className="text-lg md:text-xl text-center max-w-2xl mb-8 text-blue-100">
        Track projects, manage tasks, monitor performance and handle leave approvals
        — all in one powerful system.
      </p>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl">
        <div className="bg-white/10 p-5 rounded-lg backdrop-blur">
          <h3 className="font-semibold text-lg mb-2">📊 Performance Tracking</h3>
          <p className="text-sm text-blue-100">
            Managers can review daily progress and rate employees.
          </p>
        </div>

        <div className="bg-white/10 p-5 rounded-lg backdrop-blur">
          <h3 className="font-semibold text-lg mb-2">🗂 Project & Tasks</h3>
          <p className="text-sm text-blue-100">
            Assign tasks, deadlines and monitor team productivity.
          </p>
        </div>

        <div className="bg-white/10 p-5 rounded-lg backdrop-blur">
          <h3 className="font-semibold text-lg mb-2">📅 Leave Management</h3>
          <p className="text-sm text-blue-100">
            Majority-based approval with HR tie-breaker and calendar view.
          </p>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <Link
        href="/login"
        className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-100 transition shadow-lg"
      >
        Login to System
      </Link>

      {/* FOOTER */}
      <p className="mt-10 text-sm text-blue-200">
        © {new Date().getFullYear()} Employee Management System
      </p>
    </div>
  );
}