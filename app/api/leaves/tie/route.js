import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";

export async function GET() {
  await connectDB();

  const leaves = await Leave.find({ status: "tie" })
    .populate("employee", "name empNumber")
    .populate("votes.manager", "name empNumber")
    .sort({ createdAt: -1 });

  return Response.json(leaves);
}
