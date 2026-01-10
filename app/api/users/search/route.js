import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const role = searchParams.get("role");

  const users = await User.find({
    role,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { empNumber: { $regex: query, $options: "i" } },
    ],
  }).select("name empNumber role");

  return Response.json(users);
}
