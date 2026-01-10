import { connectDB } from "../../../../lib/db";
import ProgressUpdate from "../../../../models/ProgressUpdate";
import "../../../../models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  const employeeId = searchParams.get("employeeId"); // optional

  if (!taskId) {
    return Response.json({ error: "Task ID required" }, { status: 400 });
  }

  let query = { task: taskId };

  if (employeeId) {
    query.employee = employeeId;
  }

  const updates = await ProgressUpdate.find(query)
    .populate("employee", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(updates);
}
