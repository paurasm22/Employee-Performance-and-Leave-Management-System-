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

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // manager
      required: true,
    },

    // 🔥 NEW FIELDS (Safe Additions)

    status: {
      type: String,
      enum: ["submitted", "edited", "overridden"],
      default: "submitted",
    },

    // HR override system
    hrOverride: {
      isOverridden: {
        type: Boolean,
        default: false,
      },
      hr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      newRating: {
        type: String,
        enum: ["Excellent", "Good", "Satisfactory", "Needs Improvement"],
      },
      hrComment: String,
      overriddenAt: Date,
    },

    // Manager edit tracking
    lastEditedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.PerformanceReview ||
  mongoose.model("PerformanceReview", PerformanceReviewSchema);
