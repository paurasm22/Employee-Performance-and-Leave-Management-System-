import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Tasks";
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

    // 1️⃣ Find manager projects
    const projects = await Project.find({ managers: managerId });
    const projectIds = projects.map((p) => p._id);

    // 2️⃣ Count tasks under those projects
    const taskCount = await Task.countDocuments({
      project: { $in: projectIds },
    });

    // 3️⃣ Get recent tasks
    const recentTasks = await Task.find({
      project: { $in: projectIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title deadline");

    // 5️⃣ Count employees under manager projects
    const employeeIds = projects.flatMap((p) =>
      p.employees.map((e) => e.toString())
    );

    const leaveRequests = await Leave.countDocuments({
      employee: { $in: employeeIds },
      status: "pending",
    });

    const uniqueEmployees = [...new Set(employeeIds)];

    return NextResponse.json({
      projects: projects.length,
      employees: uniqueEmployees.length,
      tasks: taskCount,
      leaveRequests,
      recentTasks,
    });
  } catch (error) {
    console.error("Manager Dashboard Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
