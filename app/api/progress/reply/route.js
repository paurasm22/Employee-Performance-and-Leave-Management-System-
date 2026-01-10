import { connectDB } from "../../../../lib/db";
import ProgressUpdate from "../../../../models/ProgressUpdate";

export async function POST(req) {
  await connectDB();

  const { updateId, reply } = await req.json();

  if (!updateId || !reply) {
    return Response.json(
      { error: "Update ID and reply are required" },
      { status: 400 }
    );
  }

  const updated = await ProgressUpdate.findByIdAndUpdate(
    updateId,
    { managerReply: reply },
    { new: true }
  );

  return Response.json({
    message: "Reply added",
    update: updated,
  });
}
