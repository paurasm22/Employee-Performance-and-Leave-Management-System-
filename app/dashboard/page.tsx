"use client";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type Role = "employee" | "manager" | "hr";

interface Task {
  title: string;
  deadline: string;
}

interface Leave {
  employee: {
    name: string;
    empNumber: string;
  };
  leaveType: string;
}

interface EmployeeDashboardData {
  projects: number;
  tasks: number ;
  pendingLeaves: number;
  upcomingTasks?: Task[];
}

interface ManagerDashboardData {
  projects: number;
  employees: number ;
  tasks: number ;
  leaveRequests: number;
  recentTasks?: Task[];
}

interface HRDashboardData {
  employees: number ;
  managers: number;
  projects: number ;
  pendingLeaves: number ;
  tiedLeaves: number ;
  recentLeaves?: Leave[];
}

type DashboardData =
  | EmployeeDashboardData
  | ManagerDashboardData
  | HRDashboardData;

/* ================= PAGE ================= */

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [role] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("role") as Role | null;
  });

  const [name] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("name");
  });

  const [empNumber] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("empNumber");
  });

  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userId");
  });

  useEffect(() => {
    if (!role || !userId) return;

    let url = "";

    if (role === "employee")
      url = `/api/leaves/by-employee?employeeId=${userId}`;
    if (role === "manager")
      url = `/api/dashboard/manager?userId=${userId}`;
    if (role === "hr")
      url = `/api/dashboard/hr`;

    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [role, userId]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (!data || !role) return <p className="p-6">No data found.</p>;

  const getCount = (val: number | number[]) => {
    if (!val) return 0;
    if (Array.isArray(val)) return val.length;
    return val;
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-1">Welcome, {name} 👋</h1>
        <p className="text-gray-600">
          Employee ID: <b>{empNumber}</b>
        </p>
        <p className="text-gray-600">
          Role: <b className="capitalize">{role}</b>
        </p>
      </div>

      {/* EMPLOYEE */}
      {role === "employee" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              title="Projects"
              value={getCount((data as EmployeeDashboardData).projects)}
            />
            <Card
              title="Tasks"
              value={getCount((data as EmployeeDashboardData).tasks)}
            />
            <Card
              title="Pending Leaves"
              value={getCount((data as EmployeeDashboardData).pendingLeaves)}
            />
          </div>

          <Section title="Upcoming Tasks">
            <Table
              headers={["Title", "Deadline"]}
              rows={((data as EmployeeDashboardData).upcomingTasks || []).map(
                (t) => [t.title, new Date(t.deadline).toLocaleDateString()]
              )}
            />
          </Section>
        </>
      )}

      {/* MANAGER */}
      {role === "manager" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              title="Projects"
              value={getCount((data as ManagerDashboardData).projects)}
            />
            <Card
              title="Employees"
              value={getCount((data as ManagerDashboardData).employees)}
            />
            <Card
              title="Tasks"
              value={getCount((data as ManagerDashboardData).tasks)}
            />
            <Card
              title="Leave Requests"
              value={getCount((data as ManagerDashboardData).leaveRequests)}
            />
          </div>

          <Section title="Recent Tasks">
            <Table
              headers={["Title", "Deadline"]}
              rows={((data as ManagerDashboardData).recentTasks || []).map(
                (t) => [t.title, new Date(t.deadline).toLocaleDateString()]
              )}
            />
          </Section>
        </>
      )}

      {/* HR */}
      {role === "hr" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card
              title="Employees"
              value={getCount((data as HRDashboardData).employees)}
            />
            <Card
              title="Managers"
              value={getCount((data as HRDashboardData).managers)}
            />
            <Card
              title="Projects"
              value={getCount((data as HRDashboardData).projects)}
            />
            <Card
              title="Pending Leaves"
              value={getCount((data as HRDashboardData).pendingLeaves)}
            />
            <Card
              title="Tied Leaves"
              value={getCount((data as HRDashboardData).tiedLeaves)}
            />
          </div>

          <Section title="Recent Leave Requests">
            <Table
              headers={["Employee", "Type"]}
              rows={((data as HRDashboardData).recentLeaves || []).map((l) => [
                `${l.employee.name} (${l.employee.empNumber})`,
                l.leaveType,
              ])}
            />
          </Section>
        </>
      )}
    </div>
  );
}

/* ============ COMPONENTS ============ */

interface CardProps {
  title: string;
  value: string | number;
}

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

interface TableProps {
  headers: string[];
  rows: (string | number)[][];
}

function Table({ headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((h, i) => (
              <th key={i} className="border px-3 py-2 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center p-3 text-gray-400"
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-t">
                {r.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
