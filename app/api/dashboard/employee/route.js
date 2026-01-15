import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Tasks";
import Leave from "@/models/Leave";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const projects = await Project.countDocuments({
    employees: userId,
  });

  const tasks = await Task.countDocuments({
    assignedTo: userId,
  });

  const pendingLeaves = await Leave.countDocuments({
    employee: userId,
    status: "pending",
  });

  const upcomingTasks = await Task.find({
    assignedTo: userId,
    deadline: { $gte: new Date() },
  })
    .sort({ deadline: 1 })
    .limit(5)
    .select("title deadline");

  return Response.json({
    projects,
    tasks,
    pendingLeaves,
    upcomingTasks,
  });
}
