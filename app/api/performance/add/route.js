import { connectDB } from "../../../../lib/db";
import PerformanceReview from "../../../../models/PerformanceReview";
import "../../../../models/User";
import "../../../../models/Tasks";
import "../../../../models/Project";

export async function POST(req) {
  await connectDB();

  const { employeeId, taskId, projectId, rating, comment, reviewedBy } =
    await req.json();

  if (
    !employeeId ||
    !taskId ||
    !projectId ||
    !rating ||
    !comment ||
    !reviewedBy
  ) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  // Prevent duplicate review
  const existing = await PerformanceReview.findOne({
    employee: employeeId,
    task: taskId,
  });

  if (existing) {
    return Response.json(
      { error: "Review already submitted for this task" },
      { status: 400 }
    );
  }

  const review = await PerformanceReview.create({
    employee: employeeId,
    task: taskId,
    project: projectId,
    rating,
    comment,
    reviewedBy,
  });

  return Response.json({
    message: "Performance review submitted",
    review,
  });
}
