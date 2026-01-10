import mongoose from "mongoose";

const PerformanceReviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    rating: {
      type: String,
      enum: ["Excellent", "Good", "Satisfactory", "Needs Improvement"],
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // manager
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PerformanceReview ||
  mongoose.model("PerformanceReview", PerformanceReviewSchema);
