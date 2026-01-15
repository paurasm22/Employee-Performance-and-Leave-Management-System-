import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";

const ratingScore = {
  Excellent: 4,
  Good: 3,
  Satisfactory: 2,
  "Needs Improvement": 1,
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    const reviews = await PerformanceReview.find({ employee: employeeId })
      .populate("project")
      .populate("task");

    let total = reviews.length;
    let sum = 0;

    const distribution = {
      Excellent: 0,
      Good: 0,
      Satisfactory: 0,
      "Needs Improvement": 0,
    };

    const monthly = {};
    const projectMap = {};

    reviews.forEach((r) => {
      sum += ratingScore[r.rating];
      distribution[r.rating]++;

      const month = new Date(r.createdAt).toLocaleString("default", {
        month: "short",
      });
      monthly[month] = (monthly[month] || 0) + 1;

      const projectName = r.project?.name || "Unknown";
      if (!projectMap[projectName]) projectMap[projectName] = [];
      projectMap[projectName].push(r.rating);
    });

    return NextResponse.json({
      totalReviews: total,
      averageRating: total ? (sum / total).toFixed(2) : 0,
      distribution,
      monthlyTrend: monthly,
      projectWise: projectMap,
      reviews,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
