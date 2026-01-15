import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import Project from "@/models/Project";
import "@/models/User";
import { getMonthRange, statusToColor } from "@/lib/calender";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");
  const month = searchParams.get("month");

  if (!managerId || !month) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const { start, end } = getMonthRange(month);

  // Projects where this manager is assigned
  const projects = await Project.find({ managers: managerId })
    .populate("employees", "_id")
    .select("name employees");

  const employeeIds = new Set();
  const employeeProjectMap = {};

  projects.forEach((p) => {
    p.employees.forEach((e) => {
      employeeIds.add(e._id.toString());
      if (!employeeProjectMap[e._id]) {
        employeeProjectMap[e._id] = [];
      }
      employeeProjectMap[e._id].push(p.name);
    });
  });

  const leaves = await Leave.find({
    employee: { $in: Array.from(employeeIds) },
    $or: [
      { fromDate: { $lte: end, $gte: start } },
      { toDate: { $lte: end, $gte: start } },
    ],
  }).populate("employee", "name empNumber");

  const events = leaves.map((l) => {
    const projects = employeeProjectMap[l.employee._id] || [];

    return {
      id: l._id,
      employeeName: l.employee.name,
      employeeId: l.employee.empNumber,
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
