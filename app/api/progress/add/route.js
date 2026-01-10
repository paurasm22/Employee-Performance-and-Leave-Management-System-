import { connectDB } from "../../../../lib/db";
import ProgressUpdate from "../../../../models/ProgressUpdate";
import "../../../../models/User";
import "../../../../models/Tasks";

export async function POST(req) {
  await connectDB();

  const { taskId, employeeId, comment } = await req.json();

  if (!taskId || !employeeId || !comment) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const update = await ProgressUpdate.create({
    task: taskId,
    employee: employeeId,
    comment,
  });

  return Response.json({
    message: "Progress update added",
    update,
  });
}
