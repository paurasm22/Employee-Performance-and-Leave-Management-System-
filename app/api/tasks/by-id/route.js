import { connectDB } from "../../../../lib/db";
import Tasks from "../../../../models/Tasks";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return Response.json({ error: "Task ID required" }, { status: 400 });
  }

  const task = await Tasks.findById(taskId)
    .populate("assignedTo", "name empNumber")
    .populate("project", "name");

  return Response.json(task);
}
