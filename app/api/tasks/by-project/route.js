import { connectDB } from "@/lib/db";
import Tasks from "../../../../models/Tasks";
import "@/models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return Response.json({ error: "Project ID required" }, { status: 400 });
  }

  const tasks = await Tasks.find({ project: projectId })
    .populate("assignedTo", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(tasks);
}
