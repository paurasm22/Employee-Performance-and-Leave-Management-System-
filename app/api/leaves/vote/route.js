import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import "@/models/User";

export async function POST(req) {
  await connectDB();

  const { leaveId, managerId, decision, comment } = await req.json();

  if (!["approved", "rejected"].includes(decision)) {
    return Response.json({ error: "Invalid decision" }, { status: 400 });
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    return Response.json({ error: "Leave not found" }, { status: 404 });
  }

  // Prevent double voting
  const alreadyVoted = leave.votes.find(
    (v) => v.manager.toString() === managerId
  );

  if (alreadyVoted) {
    return Response.json({ error: "Already voted" }, { status: 400 });
  }

  // Add vote
  leave.votes.push({
    manager: managerId,
    decision,
    comment,
  });

  const totalManagers = leave.managers.length;
  const approvals = leave.votes.filter((v) => v.decision === "approved").length;
  const rejects = leave.votes.filter((v) => v.decision === "rejected").length;
  const totalVotes = approvals + rejects;

  // ONLY decide when all managers voted
  if (totalVotes === totalManagers) {
    if (approvals > rejects) {
      leave.status = "approved";
    } else if (rejects > approvals) {
      leave.status = "rejected";
    } else {
      leave.status = "tie"; // Escalate to HR
    }
  } else {
    leave.status = "pending"; // Still waiting
  }

  await leave.save();

  return Response.json({ success: true });
}
