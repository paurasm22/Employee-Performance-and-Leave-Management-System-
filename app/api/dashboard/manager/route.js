import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "../../../../models/Tasks";
import Leave from "@/models/Leave";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("userId");

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });
    }

    const projects = await Project.find({ managers: managerId });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ projectId: { $in: projectIds } });
    const leaveRequests = await Leave.find({
      managers: managerId,
      status: "pending",
    });

    const employeeIds = projects.flatMap((p) =>
      p.employees.map((e) => e.toString())
    );

    const uniqueEmployees = [...new Set(employeeIds)];

    return NextResponse.json({
      projects: projects.length,
      employees: uniqueEmployees.length,
      tasks: tasks.length,
      leaveRequests: leaveRequests.length,
      recentTasks: tasks.slice(0, 5),
    });
  } catch (error) {
    console.error("Manager Dashboard Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
