import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";

export async function POST(req) {
  await connectDB();
  const { leaveId, decision } = await req.json();

  const leave = await Leave.findById(leaveId);

  if (!leave)
    return Response.json({ error: "Leave not found" }, { status: 404 });

  if (leave.status !== "tie") {
    return Response.json({
      error: "This leave is not in tie state",
    });
  }

  leave.status = decision; // approved / rejected
  await leave.save();

  return Response.json({
    message: "Final decision saved",
    status: leave.status,
  });
}
