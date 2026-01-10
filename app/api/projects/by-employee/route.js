import { connectDB } from "../../../../lib/db";
import Project from "../../../../models/Project";
import "../../../../models/User"; // needed for populate

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return Response.json({ error: "Employee ID required" }, { status: 400 });
  }

  const projects = await Project.find({
    employees: employeeId,
  })
    .populate("managers", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(projects);
}
