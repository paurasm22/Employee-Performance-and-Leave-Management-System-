"use client";
import { useEffect, useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Leave {
  _id: string;
  employee: {
    name: string;
    empNumber: string;
  };
  fromDate: string;
  toDate: string;
  status: string;
  leaveType: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<Leave[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayIndex = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const today = new Date();

  const normalize = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!role || !userId) return;

    fetch(`/api/leaves/calendar?role=${role}&userId=${userId}`)
      .then((res) => res.json())
      .then(setLeaves);
  }, []);

  const getLeavesForDay = (day: number) => {
    const date = normalize(new Date(year, month, day));

    return leaves.filter((leave) => {
      const from = normalize(new Date(leave.fromDate));
      const to = normalize(new Date(leave.toDate));

      return date >= from && date <= to; // ✅ inclusive
    });
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-200 text-green-800";
    if (status === "rejected") return "bg-red-200 text-red-800";
    if (status === "tie") return "bg-yellow-200 text-yellow-800";
    return "bg-gray-200 text-gray-800";
  };

  const calendarCells = [];

  for (let i = 0; i < startDayIndex; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    calendarCells.push(day);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPreviousMonth}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ◀
        </button>

        <h1 className="text-2xl font-bold">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {year}
        </h1>

        <button
          onClick={goToNextMonth}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ▶
        </button>
      </div>

      {/* DAYS */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((day, index) => {
          const dayLeaves = day ? getLeavesForDay(day) : [];

          return (
            <div
              key={index}
              className={`min-h-[120px] border rounded p-2 transition
                ${
                  day
                    ? "bg-white hover:bg-gray-50"
                    : "bg-transparent border-none"
                }
                ${
                  day && isToday(day)
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : ""
                }
              `}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold mb-1">
                    {day}
                  </div>

                  <div className="space-y-1">
                    {dayLeaves.map((leave) => (
                      <div
                        key={leave._id}
                        className={`text-xs px-2 py-1 rounded truncate ${statusColor(
                          leave.status
                        )}`}
                        title={`${leave.employee.name} (${leave.employee.empNumber})`}
                      >
                        {leave.employee.name} • {leave.leaveType}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
