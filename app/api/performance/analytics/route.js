import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";

export async function GET() {
  try {
    await connectDB();

    const data = await PerformanceReview.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
