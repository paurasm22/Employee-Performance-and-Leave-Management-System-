import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");

  if (!role || !userId) {
    return Response.json({ error: "Missing role or userId" }, { status: 400 });
  }

  let leaves = [];

  // =========================
  // EMPLOYEE → own leaves
  // =========================
  if (role === "employee") {
    leaves = await Leave.find({
      employee: userId,
      status: { $in: ["approved", "tie"] },
    }).populate("employee", "name empNumber");
  }

  // =========================
  // MANAGER → team leaves
  // =========================
  if (role === "manager") {
    leaves = await Leave.find({
      managers: userId,
      status: { $in: ["approved", "tie"] },
    }).populate("employee", "name empNumber");
  }

  // =========================
  // HR → all leaves
  // =========================
  if (role === "hr") {
    leaves = await Leave.find({
      status: { $in: ["approved", "tie"] },
    }).populate("employee", "name empNumber");
  }

  return Response.json(leaves);
}
