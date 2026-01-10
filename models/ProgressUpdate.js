import mongoose from "mongoose";

const ProgressUpdateSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },

    managerReply: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProgressUpdate ||
  mongoose.model("ProgressUpdate", ProgressUpdateSchema);
