import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";

const score = {
  Excellent: 4,
  Good: 3,
  Satisfactory: 2,
  "Needs Improvement": 1,
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    const reviews = await PerformanceReview.find({ manager: managerId })
      .populate("employee")
      .populate("project");

    const distribution = {
      Excellent: 0,
      Good: 0,
      Satisfactory: 0,
      "Needs Improvement": 0,
    };

    const empMap = {};
    const monthly = {};

    reviews.forEach((r) => {
      distribution[r.rating]++;

      const empName = r.employee?.name || "Unknown";
      if (!empMap[empName]) empMap[empName] = [];
      empMap[empName].push(score[r.rating]);

      const month = new Date(r.createdAt).toLocaleString("default", {
        month: "short",
      });
      monthly[month] = (monthly[month] || 0) + 1;
    });

    const avgEmployees = Object.entries(empMap).map(([name, scores]) => ({
      name,
      avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    }));

    avgEmployees.sort((a, b) => b.avg - a.avg);

    return NextResponse.json({
      distribution,
      monthlyTrend: monthly,
      topPerformers: avgEmployees.slice(0, 5),
      bottomPerformers: avgEmployees.slice(-5),
      reviews,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
