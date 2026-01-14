import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Leave from "@/models/Leave";

export async function GET() {
  try {
    await connectDB();

    const employees = await User.countDocuments({ role: "employee" });
    const managers = await User.countDocuments({ role: "manager" });
    const projects = await Project.countDocuments();

    const pendingLeaves = await Leave.countDocuments({ status: "pending" });
    const tiedLeaves = await Leave.countDocuments({ status: "tie" });

    const recentLeaves = await Leave.find()
      .populate("employee", "name empNumber")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      employees,
      managers,
      projects,
      pendingLeaves,
      tiedLeaves,
      recentLeaves,
    });
  } catch (error) {
    console.error("HR Dashboard Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
