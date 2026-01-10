import { connectDB } from "../../../../lib/db";
import PerformanceReview from "../../../../models/PerformanceReview";
import "../../../../models/User";
import "../../../../models/Tasks";
import "../../../../models/Project";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return Response.json({ error: "Employee ID required" }, { status: 400 });
  }

  const reviews = await PerformanceReview.find({
    employee: employeeId,
  })
    .populate("task", "title")
    .populate("project", "name")
    .populate("reviewedBy", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(reviews);
}
