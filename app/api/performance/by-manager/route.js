import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json([], { status: 200 });
    }

    const reviews = await PerformanceReview.find({
      $or: [{ manager: managerId }, { reviewedBy: managerId }],
    })
      .populate("employee", "name empNumber")
      .populate("task", "title")
      .populate("project", "name");

    return NextResponse.json(reviews);
  } catch (err) {
    console.error("Manager performance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
