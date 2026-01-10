import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const { empNumber, password } = await req.json();

  const user = await User.findOne({ empNumber });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signToken(user);

  return Response.json({
    token,
    role: user.role,
    name: user.name,
    userId: user._id,
  });
}
