import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export async function POST(req) {
  await connectDB();

  const { projectId, employeeId } = await req.json();

  await Project.findByIdAndUpdate(projectId, {
    $pull: { employees: employeeId },
  });

  return Response.json({ success: true });
}
