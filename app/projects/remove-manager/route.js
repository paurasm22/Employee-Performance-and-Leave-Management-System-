import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export async function POST(req) {
  await connectDB();

  const { projectId, managerId } = await req.json();

  await Project.findByIdAndUpdate(projectId, {
    $pull: { managers: managerId },
  });

  return Response.json({ success: true });
}
