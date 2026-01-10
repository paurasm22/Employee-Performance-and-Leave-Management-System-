import { connectDB } from "../../../../lib/db";
import PerformanceReview from "../../../../models/PerformanceReview";
import "../../../../models/User";
import "../../../../models/Task";
import "../../../../models/Project";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return Response.json({ error: "Project ID required" }, { status: 400 });
  }

  const reviews = await PerformanceReview.find({
    project: projectId,
  })
    .populate("employee", "name empNumber")
    .populate("task", "title")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 });

  return Response.json(reviews);
}
