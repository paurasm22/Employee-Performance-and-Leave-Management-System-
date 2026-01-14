import { connectDB } from "@/lib/db";
import Tasks from "@/models/Tasks";
import Projects from "@/models/Project";
import "@/models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  if (!managerId) {
    return Response.json({ error: "Manager ID required" }, { status: 400 });
  }

  // Find projects owned by this manager
  const projects = await Projects.find({ manager: managerId }).select("_id");

  const projectIds = projects.map((p) => p._id);

  // Find tasks under those projects
  const tasks = await Tasks.find({ project: { $in: projectIds } })
    .populate("assignedTo", "name empNumber")
    .populate("project", "name")
    .sort({ deadline: 1 });

  return Response.json(tasks);
}
