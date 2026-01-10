import { connectDB } from "../../../../lib/db";
import Project from "../../../../models/Project";

export async function POST(req) {
  await connectDB();

  const {
    name,
    description,
    department,
    startDate,
    endDate,
    managers,
    employees,
  } = await req.json();

  const project = await Project.create({
    name,
    description,
    department,
    startDate,
    endDate,
    managers,
    employees,
  });

  return Response.json({
    message: "Project created successfully",
    projectId: project._id,
  });
}
