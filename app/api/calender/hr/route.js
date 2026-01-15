import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import Project from "@/models/Project";
import "@/models/User";
import { getMonthRange, statusToColor } from "@/lib/calender";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month) {
    return Response.json({ error: "Month required" }, { status: 400 });
  }

  const { start, end } = getMonthRange(month);

  /* 1️⃣ Fetch leaves */
  const leaves = await Leave.find({
    $or: [
      { fromDate: { $lte: end, $gte: start } },
      { toDate: { $lte: end, $gte: start } },
    ],
  }).populate("employee", "name empNumber department");

  /* 2️⃣ Fetch projects with employees + managers */
  const projects = await Project.find()
    .populate("employees", "_id")
    .populate("managers", "name empNumber")
    .select("name employees managers");

  /* 3️⃣ Build Employee → Projects map */
  const employeeProjectMap = {};
  const employeeManagerMap = {};

  projects.forEach((p) => {
    p.employees.forEach((e) => {
      const empId = e._id.toString();

      if (!employeeProjectMap[empId]) {
        employeeProjectMap[empId] = [];
      }

      employeeProjectMap[empId].push(p.name);

      // assign first manager of the project
      if (!employeeManagerMap[empId]) {
        employeeManagerMap[empId] = p.managers?.[0] || null;
      }
    });
  });

  /* 4️⃣ Build calendar events */
  const events = leaves.map((l) => {
    const empId = l.employee._id.toString();
    const projects = employeeProjectMap[empId] || [];
    const manager = employeeManagerMap[empId];

    return {
      id: l._id,
      employeeName: l.employee.name,
      employeeId: l.employee.empNumber,
      department: l.employee.department,
      managerName: manager?.name || "-",
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
