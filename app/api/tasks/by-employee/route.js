import { connectDB } from "../../../../lib/db";
import Tasks from "../../../../models/Tasks";
import "../../../../models/User"; // required for populate

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");

  if (!employeeId) {
    return Response.json({ error: "Employee ID required" }, { status: 400 });
  }

  const tasks = await Tasks.find({
    assignedTo: employeeId,
  })
    .populate("assignedTo", "name empNumber")
    .populate("project", "name")
    .sort({ deadline: 1 });

  return Response.json(tasks);
}
