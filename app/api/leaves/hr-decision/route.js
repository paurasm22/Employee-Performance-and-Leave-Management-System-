import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";

export async function POST(req) {
  await connectDB();

  const { leaveId, decision } = await req.json();

  if (!["approved", "rejected"].includes(decision)) {
    return Response.json({ error: "Invalid decision" }, { status: 400 });
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    return Response.json({ error: "Leave not found" }, { status: 404 });
  }

  if (leave.status !== "tie") {
    return Response.json({ error: "Not a tied request" }, { status: 400 });
  }

  leave.status = decision;
  leave.resolvedByHR = true;
  leave.hrDecision = decision;
  leave.hrDecidedAt = new Date();

  await leave.save();

  return Response.json({ success: true });
}
