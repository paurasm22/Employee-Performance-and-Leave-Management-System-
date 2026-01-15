import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";
import Task from "@/models/Tasks";

export async function POST(req) {
  try {
    await connectDB();
    const { taskId } = await req.json();

    const task = await Task.findById(taskId)
      .populate("assignedTo")
      .populate("project");

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    for (const emp of task.assignedTo) {
      const exists = await PerformanceReview.findOne({
        task: taskId,
        employee: emp._id,
      });

      if (!exists) {
        await PerformanceReview.create({
          employee: emp._id,
          task: task._id,
          project: task.project._id,
          rating: "Satisfactory",
          comment: "Pending manager review",
          manager: task.createdBy,
          reviewedBy: task.createdBy,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
