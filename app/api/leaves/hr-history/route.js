import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import "@/models/User";

export async function GET() {
  await connectDB();

  const leaves = await Leave.find({
    resolvedByHR: true,
  })
    .populate("employee", "name empNumber")
    .populate("votes.manager", "name empNumber")
    .sort({ hrDecidedAt: -1 });

  return Response.json(leaves);
}
