import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PerformanceReview from "@/models/PerformanceReview";

export async function POST(req) {
  try {
    await connectDB();
    const { reviewId, rating, comment, hrId } = await req.json();

    const review = await PerformanceReview.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    review.rating = rating;
    review.comment = `[HR Override] ${comment}`;
    review.reviewedBy = hrId;

    await review.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
