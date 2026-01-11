import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import Project from "@/models/Project";
import "@/models/User";
import { getMonthRange, statusToColor } from "@/lib/calendar";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month) {
    return Response.json({ error: "Month required" }, { status: 400 });
  }

  const { start, end } = getMonthRange(month);

  const leaves = await Leave.find({
    $or: [
      { fromDate: { $lte: end, $gte: start } },
      { toDate: { $lte: end, $gte: start } },
    ],
  }).populate("employee", "name empNumber department");

  const projects = await Project.find()
    .populate("employees", "_id")
    .select("name employees");

  const employeeProjectMap = {};

  projects.forEach((p) => {
    p.employees.forEach((e) => {
      if (!employeeProjectMap[e._id]) {
        employeeProjectMap[e._id] = [];
      }
      employeeProjectMap[e._id].push(p.name);
    });
  });

  const events = leaves.map((l) => {
    const projects = employeeProjectMap[l.employee._id] || [];

    return {
      id: l._id,
      employeeName: l.employee.name,
      employeeId: l.employee.empNumber,
      department: l.employee.department,
      projectLabel:
        projects.length === 1 ? projects[0] : `${projects.length} Projects`,
      projects,
      fromDate: l.fromDate,
      toDate: l.toDate,
      status: l.status,
      color: statusToColor(l.status),
    };
  });

  return Response.json(events);
}
