import { connectDB } from "../../../../lib/db";
import Project from "../../../../models/Project";
import "../../../../models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");

  let filter = {};

  if (role === "manager") {
    filter = { managers: userId };
  } 
  else if (role === "employee") {
    filter = { employees: userId };
  }
  // HR → no filter → all projects

  const projects = await Project.find(filter)
    .populate("managers", "name empNumber")
    .populate("employees", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(projects);
}
