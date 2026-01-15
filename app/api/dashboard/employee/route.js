import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Tasks";
import Project from "@/models/Project";
import Leave from "@/models/Leave";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const tasks = await Task.find({ assignedTo: userId });
    const projects = await Project.find({ employees: userId });
    const pendingLeaves = await Leave.countDocuments({
      employee: userId,
      status: "pending",
    });

    const upcomingTasks = tasks
      .filter((t) => new Date(t.deadline) >= new Date())
      .slice(0, 5);

    return NextResponse.json({
      projects: projects.length,
      tasks: tasks.length,
      pendingLeaves,
      upcomingTasks,
    });
  } catch (error) {
    console.error("Employee Dashboard Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
