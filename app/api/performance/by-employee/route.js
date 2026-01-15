import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";
import mongoose from "mongoose";
import "../../../../models/Project";
import "../../../../models/Tasks";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return Response.json([], { status: 200 });
  }

  const objectId = new mongoose.Types.ObjectId(employeeId);

  const reviews = await PerformanceReview.find({
    employee: objectId,
  })
    .populate("project", "name")
    .populate("task", "title")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });

  return Response.json(reviews);
}
