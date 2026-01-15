"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ================= TYPES ================= */

type Rating = "Excellent" | "Good" | "Satisfactory" | "Needs Improvement";

interface User {
  _id: string;
  name: string;
  empNumber: string;
}

interface Task {
  _id: string;
  title: string;
}

interface Project {
  _id: string;
  name: string;
}

interface PerformanceReview {
  _id: string;
  rating: Rating;
  comment: string;
  createdAt: string;
  employee: User;
  task: Task;
  project: Project;
  manager: User;
  reviewedBy: User;
}

/* ================= UTILS ================= */

const ratingScore: Record<Rating, number> = {
  Excellent: 4,
  Good: 3,
  Satisfactory: 2,
  "Needs Improvement": 1,
};

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171"];

/* ================= MAIN ================= */

export default function PerformancePage() {
  const [role, setRole] = useState<string | null>(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role");
  }
  return null;
});

const [userId, setUserId] = useState<string | null>(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
});

  if (!role || !userId) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-8">
      {role === "employee" && (
        <>
          <Analytics
            title="My Performance Analytics"
            endpoint={`/api/performance/by-employee?employeeId=${userId}`}
          />
          <EmployeePerformance userId={userId} />
        </>
      )}

      {role === "manager" && (
        <>
          <Analytics
            title="Team Performance Analytics"
            endpoint={`/api/performance/by-manager?managerId=${userId}`}
          />
          <ManagerPerformance userId={userId} />
        </>
      )}

      {role === "hr" && (
        <>
          <Analytics
            title="Organization Performance Analytics"
            endpoint={`/api/performance/all`}
          />
          <HRPerformance />
        </>
      )}
    </div>
  );
}

/* ================================================= */
/* ================= ANALYTICS ===================== */
/* ================================================= */

function Analytics({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
        else if (Array.isArray(data.data)) setReviews(data.data);
        else setReviews([]);
      });
  }, [endpoint]);

  const filtered = reviews.filter((r) => {
    const d = new Date(r.createdAt).getTime();
    if (from && d < new Date(from).getTime()) return false;
    if (to && d > new Date(to).getTime()) return false;
    return true;
  });

  const total = filtered.length;

  const avg =
    total === 0
      ? 0
      : (
          filtered.reduce((a, b) => a + ratingScore[b.rating], 0) / total
        ).toFixed(2);

  const best =
    filtered.length > 0
      ? Math.max(...filtered.map((r) => ratingScore[r.rating]))
      : 0;

  const worst =
    filtered.length > 0
      ? Math.min(...filtered.map((r) => ratingScore[r.rating]))
      : 0;

  const ratingDist = (Object.keys(ratingScore) as Rating[]).map((r) => ({
    name: r,
    value: filtered.filter((f) => f.rating === r).length,
  }));

  const projectMap: Record<string, number> = {};
  filtered.forEach((r) => {
    projectMap[r.project.name] =
      (projectMap[r.project.name] || 0) + ratingScore[r.rating];
  });

  const projectData = Object.keys(projectMap).map((p) => ({
    name: p,
    score: projectMap[p],
  }));

  const monthMap: Record<string, number> = {};
  filtered.forEach((r) => {
    const m = new Date(r.createdAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthMap[m] = (monthMap[m] || 0) + ratingScore[r.rating];
  });

  const trendData = Object.keys(monthMap).map((m) => ({
    month: m,
    score: monthMap[m],
  }));

const downloadPDF = async () => {
  const pdfDom = document.getElementById("pdf-clone");
  if (!pdfDom) return;

  const canvas = await html2canvas(pdfDom, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    foreignObjectRendering: true,   // 🔥 THIS IS THE FIX
  });

  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const width = 210;
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(img, "PNG", 0, 0, width, height);
  pdf.save("performance-report.pdf");
};

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={downloadPDF}
          className=" text-white px-4 py-2 rounded"
        >
         
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="date"
          className="border p-2 rounded"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div ref={dashboardRef} id="pdf-area">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Total Reviews" value={total} />
          <Card title="Average Score" value={avg} />
          <Card title="Best Score" value={best} />
          <Card title="Worst Score" value={worst} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard title="Monthly Trend">
            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <CartesianGrid stroke="#eee" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="Rating Distribution">
            <PieChart>
              <Pie data={ratingDist} dataKey="value" nameKey="name" label>
                {ratingDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartCard>

          <ChartCard title="Project-wise Performance" full>
            <BarChart data={projectData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid stroke="#eee" />
              <Bar dataKey="score" fill="#4f46e5" />
            </BarChart>
          </ChartCard>
        </div>
      </div>

       <div
    id="pdf-clone"
    style={{
      position: "fixed",
      left: "-9999px",
      top: 0,
      width: "1000px",
      background: "#fff",
      padding: "20px",
      fontFamily: "Arial",
    }}
  >
    <h2>{title}</h2>
    <p>Total Reviews: {total}</p>
    <p>Average Score: {avg}</p>
    <p>Best Score: {best}</p>
    <p>Worst Score: {worst}</p>

    <h3>Project Performance</h3>
    {projectData.map((p) => (
      <p key={p.name}>
        {p.name}: {p.score}
      </p>
    ))}

    <h3>Monthly Trend</h3>
    {trendData.map((m) => (
      <p key={m.month}>
        {m.month}: {m.score}
      </p>
    ))}
  </div>
</div>
  );
}

/* ================================================= */
/* ================= EMPLOYEE ====================== */
/* ================================================= */

function EmployeePerformance({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);

  useEffect(() => {
    fetch(`/api/performance/by-employee?employeeId=${userId}`)
      .then((res) => res.json())
      .then(setReviews);
  }, [userId]);

  return (
    <>
      <h2 className="text-xl font-bold">My Performance</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{r.task.title}</p>
            <p className="text-sm text-gray-500">{r.project.name}</p>
            <p className="mt-2">
              Rating: <b>{r.rating}</b>
            </p>
            <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================================= */
/* ================= MANAGER ======================= */
/* ================================================= */

function ManagerPerformance({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating>("Good");
  const [comment, setComment] = useState("");

  const load = () => {
    fetch(`/api/performance/by-manager?managerId=${userId}`)
      .then((res) => res.json())
      .then(setReviews);
  };

  useEffect(() => {
    load();
  }, [userId]);

  const saveEdit = async () => {
    await fetch("/api/performance/manager-edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: editingId, rating, comment }),
    });

    setEditingId(null);
    load();
  };

  return (
    <>
      <h2 className="text-xl font-bold">Team Performance</h2>

      <table className="w-full border bg-white shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Employee</th>
            <th>Task</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {reviews.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="p-2">{r.employee.name}</td>
              <td>{r.task.title}</td>
              <td>{r.rating}</td>
              <td>{r.comment}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingId(r._id);
                    setRating(r.rating);
                    setComment(r.comment);
                  }}
                  className="text-blue-600"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingId && (
        <EditBox
          rating={rating}
          comment={comment}
          setRating={setRating}
          setComment={setComment}
          onSave={saveEdit}
          label="Edit Review"
        />
      )}
    </>
  );
}

/* ================================================= */
/* ================= HR ============================ */
/* ================================================= */

function HRPerformance() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating>("Good");
  const [comment, setComment] = useState("");

  const load = () => {
    fetch("/api/performance/all")
      .then((res) => res.json())
      .then(setReviews);
  };

  useEffect(() => {
    load();
  }, []);

  const override = async () => {
    const hrId = localStorage.getItem("userId");

    await fetch("/api/performance/hr-override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId: overrideId, rating, comment, hrId }),
    });

    setOverrideId(null);
    load();
  };

  return (
    <>
      <h2 className="text-xl font-bold">HR Performance Control</h2>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="bg-white p-4 rounded shadow flex justify-between"
          >
            <div>
              <p className="font-semibold">
                {r.employee.name} — {r.task.title}
              </p>
              <p className="text-sm">
                {r.rating} — {r.comment}
              </p>
            </div>

            <button
              onClick={() => {
                setOverrideId(r._id);
                setRating(r.rating);
                setComment(r.comment);
              }}
              className="text-red-600"
            >
              Override
            </button>
          </div>
        ))}
      </div>

      {overrideId && (
        <EditBox
          rating={rating}
          comment={comment}
          setRating={setRating}
          setComment={setComment}
          onSave={override}
          label="HR Override"
        />
      )}
    </>
  );
}

/* ================= SHARED ================= */

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
  full,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`bg-white p-4 rounded shadow ${full ? "md:col-span-2" : ""}`}>
      <h2 className="font-semibold mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function EditBox({
  rating,
  comment,
  setRating,
  setComment,
  onSave,
  label,
}: {
  rating: Rating;
  comment: string;
  setRating: (v: Rating) => void;
  setComment: (v: string) => void;
  onSave: () => void;
  label: string;
}) {
  return (
    <div className="mt-4 bg-white p-4 rounded shadow max-w-md">
      <h3 className="font-semibold mb-2">{label}</h3>

      <select
        className="border p-2 w-full mb-2"
        value={rating}
        onChange={(e) => setRating(e.target.value as Rating)}
      >
        <option>Excellent</option>
        <option>Good</option>
        <option>Satisfactory</option>
        <option>Needs Improvement</option>
      </select>

      <textarea
        className="border p-2 w-full mb-2"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        onClick={onSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
