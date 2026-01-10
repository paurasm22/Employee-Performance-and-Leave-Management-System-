import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    empNumber: data.empNumber,
    name: data.name,
    password: hashedPassword,
    role: data.role,
    department: data.department,
  });

  return Response.json({ message: "User created", user });
}
