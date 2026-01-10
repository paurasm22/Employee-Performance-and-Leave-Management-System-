import { connectDB } from "../../../../lib/db";
import Tasks from "../../../../models/Tasks";

export async function POST(req) {
  await connectDB();

  const { taskId, status } = await req.json();

  if (!taskId || !status) {
    return Response.json(
      { error: "Task ID and status required" },
      { status: 400 }
    );
  }

  const updatedTask = await Tasks.findByIdAndUpdate(
    taskId,
    { status },
    { new: true }
  );

  return Response.json({
    message: "Task status updated",
    task: updatedTask,
  });
}
