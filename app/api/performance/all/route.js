import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "../../../../models/PerformanceReview";
import "@/models/Tasks"; // ✅ THIS WAS MISSING
import "@/models/Project";
export async function GET() {
  try {
    await connectDB();

    const reviews = await PerformanceReview.find()
      .populate("employee")
      .populate("task")
      .populate("project")
      .populate("manager");

    return NextResponse.json(reviews);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
