import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import "@/models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get("managerId");

  const leaves = await Leave.find({
    managers: managerId,
  })
    .populate("employee", "name empNumber")
    .populate("votes.manager", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(leaves);
}
