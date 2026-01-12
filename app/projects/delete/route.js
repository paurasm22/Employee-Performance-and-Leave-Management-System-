import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export async function DELETE(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return Response.json({ error: "Project ID required" }, { status: 400 });
  }

  await Project.findByIdAndDelete(projectId);

  return Response.json({ success: true });
}
