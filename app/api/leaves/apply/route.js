import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import Project from "@/models/Project";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const { employeeId, fromDate, toDate, leaveType, reason } = body;

  // Find projects employee is part of
  const projects = await Project.find({
    employees: employeeId,
  }).populate("managers");

  const managersSet = new Set();
  projects.forEach((p) => {
    p.managers.forEach((m) => managersSet.add(m._id.toString()));
  });

  const managers = Array.from(managersSet);

  const leave = await Leave.create({
    employee: employeeId,
    fromDate,
    toDate,
    leaveType,
    reason,
    managers,
  });

  return Response.json({
    message: "Leave request submitted",
    leave,
  });
}
