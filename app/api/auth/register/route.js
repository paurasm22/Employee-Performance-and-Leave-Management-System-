import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const { empNumber, name, password, role, department } = await req.json();

    if (!empNumber || !name || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await User.findOne({ empNumber });
    if (existing) {
      return Response.json(
        { error: "Employee already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      empNumber,
      name,
      password: hashedPassword,
      role: role || "employee",
      department,
    });

    return Response.json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
