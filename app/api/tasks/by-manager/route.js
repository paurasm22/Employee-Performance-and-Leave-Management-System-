import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Tasks";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  if (!managerId) return NextResponse.json([]);

  const projects = await Project.find({ managers: managerId }).select("_id");
  const projectIds = projects.map((p) => p._id);

  const tasks = await Task.find({
    project: { $in: projectIds },
  })
    .populate("assignedTo", "name empNumber")
    .populate("project", "name")
    .select("title status deadline assignedTo project");

  return NextResponse.json(tasks);
}
