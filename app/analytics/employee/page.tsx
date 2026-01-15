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

interface Review {
  _id: string;
  rating: Rating;
  createdAt: string;
  project: { name: string };
}

/* ================= UTILS ================= */

const ratingScore: Record<Rating, number> = {
  Excellent: 4,
  Good: 3,
  Satisfactory: 2,
  "Needs Improvement": 1,
};

const COLORS: string[] = ["#4ade80", "#60a5fa", "#facc15", "#f87171"];

/* ================= PAGE ================= */

export default function EmployeeAnalyticsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const dashboardRef = useRef<HTMLDivElement>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/performance/by-employee?employeeId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
        else if (Array.isArray(data.data)) setReviews(data.data);
        else setReviews([]);
      });
  }, [userId]);

  /* ================= FILTER ================= */

  const filtered = reviews.filter((r) => {
    const d = new Date(r.createdAt).getTime();
    if (from && d < new Date(from).getTime()) return false;
    if (to && d > new Date(to).getTime()) return false;
    return true;
  });

  /* ================= KPIs ================= */

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

  /* ================= CHART DATA ================= */

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

  /* ================= PDF ================= */

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;

    const canvas = await html2canvas(dashboardRef.current);
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save("my-performance-report.pdf");
  };

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">My Performance Analytics</h1>

        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* FILTERS */}
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

      <div ref={dashboardRef}>
        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Total Reviews" value={total} />
          <Card title="Average Score" value={avg} />
          <Card title="Best Score" value={best} />
          <Card title="Worst Score" value={worst} />
        </div>

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Trend */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Monthly Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
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
            </ResponsiveContainer>
          </div>

          {/* Pie */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Rating Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ratingDist} dataKey="value" nameKey="name" label>
                  {ratingDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Project */}
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <h2 className="font-semibold mb-2">Project-wise Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#eee" />
                <Bar dataKey="score" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
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
