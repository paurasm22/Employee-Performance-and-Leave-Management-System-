import { connectDB } from "../../../../lib/db";
import Project from "../../../../models/Project";
import "../../../../models/User"; // 🔴 REQUIRED for populate()
export async function GET() {
  await connectDB();

  const projects = await Project.find()
    .populate("managers", "name empNumber")
    .populate("employees", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(projects);
}
