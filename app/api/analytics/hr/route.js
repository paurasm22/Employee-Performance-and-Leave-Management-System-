import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";

const score = {
  Excellent: 4,
  Good: 3,
  Satisfactory: 2,
  "Needs Improvement": 1,
};

export async function GET() {
  try {
    await connectDB();

    const reviews = await PerformanceReview.find()
      .populate("employee")
      .populate("project");

    const distribution = {
      Excellent: 0,
      Good: 0,
      Satisfactory: 0,
      "Needs Improvement": 0,
    };

    const empMap = {};
    const projectMap = {};
    const monthly = {};

    reviews.forEach((r) => {
      distribution[r.rating]++;

      const emp = r.employee?.name || "Unknown";
      if (!empMap[emp]) empMap[emp] = [];
      empMap[emp].push(score[r.rating]);

      const proj = r.project?.name || "Unknown";
      if (!projectMap[proj]) projectMap[proj] = [];
      projectMap[proj].push(score[r.rating]);

      const month = new Date(r.createdAt).toLocaleString("default", {
        month: "short",
      });
      monthly[month] = (monthly[month] || 0) + 1;
    });

    const employeeAverages = Object.entries(empMap).map(([name, scores]) => ({
      name,
      avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    }));

    const underperformers = employeeAverages.filter((e) => e.avg < 2);

    return NextResponse.json({
      distribution,
      monthlyTrend: monthly,
      employeeAverages,
      underperformers,
      reviews,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
