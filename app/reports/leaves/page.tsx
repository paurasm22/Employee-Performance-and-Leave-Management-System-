
"use client";

import { useEffect, useMemo, useState } from "react";

/* ================= TYPES ================= */

type Role = "employee" | "manager" | "hr";

interface Employee {
  _id: string;
  name: string;
  empNumber: string;
}

interface Leave {
  _id: string;
  fromDate: string;
  toDate: string;
  status: "approved" | "rejected" | "pending" | "tie";
  leaveType: string;
  employee: Employee;
}
interface Manager {
  _id: string;
  name: string;
  empNumber: string;
}

interface Employee {
  _id: string;
  name: string;
  empNumber: string;
}

const TOTAL_LEAVES = 30;
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ================= PAGE ================= */

export default function LeaveReportsPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("role") as Role | null;
    const id = localStorage.getItem("userId");
    setRole(r);
    setUserId(id);
  }, []);

  if (!role || !userId) return <p className="p-6">Loading...</p>;

  if (role === "employee") return <EmployeeLeaveReport userId={userId} />;
  if (role === "manager") return <ManagerLeaveReport userId={userId} />;
  if (role === "hr") return <HRLeaveReport userId={userId} />;

  return null;
}

/* ================================================= */
/* ================= EMPLOYEE ====================== */
/* ================================================= */

function EmployeeLeaveReport({ userId }: { userId: string }) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetch(`/api/leaves/by-employee?employeeId=${userId}`)
      .then((res) => res.json())
      .then(setLeaves);
  }, [userId]);

  return (
    <BaseLeaveUI
      title="My Leave Report"
      leaves={leaves}
      showEmployeeName={false}
      role="employee"
      userId={userId}
      monthFilter={monthFilter}
      setMonthFilter={setMonthFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
    />
  );
}

/* ================================================= */
/* ================= MANAGER ======================= */
/* ================================================= */

function ManagerLeaveReport({ userId }: { userId: string }) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch(`/api/leaves/by-manager?managerId=${userId}`)
      .then((res) => res.json())
      .then(setLeaves);
  }, [userId]);

  return (
    <BaseLeaveUI
      title="Team Leave Report"
      leaves={leaves}
      showEmployeeName={true}
      role="manager"
      userId={userId}
      monthFilter={monthFilter}
      setMonthFilter={setMonthFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
    />
  );
}

/* ================================================= */
/* ================= HR ============================ */
/* ================================================= */

function HRLeaveReport({ userId }: { userId: string }) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

 useEffect(() => {
 const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  

  fetch(`/api/calender/hr?month=${month}`)
    .then((res) => res.json())
    .then((events) => {
      const mapped = events.map((e: any) => ({
        _id: e.id,
        fromDate: e.fromDate,
        toDate: e.toDate,
        status: e.status,
        leaveType: e.projectLabel,
         manager: { name: e.managerName }, 
        employee: {
          _id: e.employeeId,
          name: e.employeeName,
          empNumber: e.employeeId,
        },
      }));

      setLeaves(mapped);
    });
}, []);

  return (
    <BaseLeaveUI
      title="Organization Leave Report"
      leaves={leaves}
      showEmployeeName={true}
      role="hr"
      userId={userId}
      monthFilter={monthFilter}
      setMonthFilter={setMonthFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
    />
  );
}


/* ================================================= */
/* ================= BASE UI ======================= */
/* ================================================= */

function BaseLeaveUI({
  title,
  leaves,
  showEmployeeName,
  role,
  userId,
  monthFilter,
  setMonthFilter,
  statusFilter,
  setStatusFilter,
}: {
  title: string;
  leaves: Leave[];
  showEmployeeName: boolean;
  role: Role;
  userId: string;
  monthFilter: string;
  setMonthFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  const [search, setSearch] = useState("");

  const approvedLeaves = leaves.filter((l) => l.status === "approved");

  const usedDays = approvedLeaves.reduce((sum, l) => {
    const from = new Date(l.fromDate);
    const to = new Date(l.toDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const diff =
      Math.round(
        (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    return sum + diff;
  }, 0);

  const remainingLeaves = TOTAL_LEAVES - usedDays;

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const m = new Date(l.fromDate).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      const matchMonth = monthFilter ? m === monthFilter : true;
      const matchStatus = statusFilter ? l.status === statusFilter : true;
      const matchSearch = search
  ? l.employee.name.toLowerCase().includes(search.toLowerCase()) ||
    l.employee.empNumber.toLowerCase().includes(search.toLowerCase()) ||
    (l as any).manager?.name?.toLowerCase().includes(search.toLowerCase())
  : true;

 


      return matchMonth && matchStatus && matchSearch;
    });
  }, [leaves, monthFilter, statusFilter,search]);

  

  const months = Array.from(
    new Set(
      leaves.map((l) =>
        new Date(l.fromDate).toLocaleString("default", {
          month: "short",
          year: "numeric",
        })
      )
    )
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {/* KPI */}
      {role === "employee" && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card title="Total Leaves" value={TOTAL_LEAVES} />
          <Card title="Used Leaves" value={usedDays} />
          <Card title="Remaining Leaves" value={remainingLeaves} />
        </div>
      )}

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        {showEmployeeName && (
    <input
      type="text"
      placeholder="Search employee..."
      className="border p-2 rounded w-64"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  )}
        
        
        <select
          className="border p-2 rounded"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">All Months</option>
          {months.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="tie">Tie</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded mb-10 overflow-x-auto">
        <table className="w-full table-fixed">
         <thead className="bg-gray-100">
  <tr>
    {role === "hr" && <th className="p-2 w-[160px] text-left">Manager</th>}
    {showEmployeeName && <th className="p-2 w-[200px] text-left">Employee</th>}
    <th className="p-2 w-[120px] text-left">From</th>
    <th className="p-2 w-[120px] text-left">To</th>
    <th className="p-2 w-[120px]">Status</th>
    <th className="p-2 w-[140px]">Type</th>
    <th className="p-2 w-[80px]">Days</th>
  </tr>
</thead>

          <tbody>
            {filteredLeaves.map((l) => {
              const from = new Date(l.fromDate);
              const to = new Date(l.toDate);
              const days =
                Math.round(
                  (to.getTime() - from.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;

              return (
                <tr key={l._id} className="border-t text-sm">
                  {role === "hr" && (
  <td className="p-2 truncate"> {(l as any).manager?.name} ({l.employee?.empNumber})
  </td>
)}

{showEmployeeName && (
  <td className="p-2 truncate">
    {l.employee?.name} ({l.employee?.empNumber})
  </td>
)}

                  <td className="p-2">{from.toLocaleDateString()}</td>
                  <td className="p-2">{to.toLocaleDateString()}</td>
                  <td className="capitalize">{l.status}</td>
                  <td className="p-2 truncate">{l.leaveType}</td>
                  <td className="p-2 text-center">{days}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CALENDAR */}
      <CalendarView leaves={filteredLeaves} />
    </div>
  );
}

/* ================================================= */
/* ================= CALENDAR ====================== */
/* ================================================= */

function CalendarView({ leaves }: { leaves: Leave[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayIndex = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getLeavesForDay = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    return leaves.filter((leave) => {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return date >= from && date <= to;
    });
  };

  const calendarCells: (number | null)[] = [];

  for (let i = 0; i < startDayIndex; i++) calendarCells.push(null);
  for (let day = 1; day <= totalDays; day++) calendarCells.push(day);

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-200 text-green-800";
    if (status === "rejected") return "bg-red-200 text-red-800";
    if (status === "tie") return "bg-yellow-200 text-yellow-800";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Calendar View</h2>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          ◀
        </button>

        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>

        <button
          onClick={goToNextMonth}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          ▶
        </button>
      </div>

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

      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((day, index) => {
          const dayLeaves = day ? getLeavesForDay(day) : [];

          return (
            <div
              key={index}
              className={`min-h-[120px] border rounded p-2 ${
                day ? "bg-white" : "bg-transparent border-none"
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayLeaves.map((leave) => (
                      <div
                        key={leave._id}
                        className={`text-xs px-2 py-1 rounded truncate ${statusColor(
                          leave.status
                        )}`}
                      >
                        {leave.leaveType}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ================= CARD ================= */

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
