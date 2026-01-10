import { connectDB } from "../../../../lib/db";
import Tasks from "../../../../models/Tasks";
export async function POST(req) {
  await connectDB();

  const { title, description, deadline, projectId, assignedTo } =
    await req.json();

  const task = await Tasks.create({
    title,
    description,
    deadline,
    project: projectId,
    assignedTo,
  });

  return Response.json({
    message: "Task created successfully",
    taskId: task._id,
  });
}
