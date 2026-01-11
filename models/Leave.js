import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  decision: {
    type: String,
    enum: ["approved", "rejected"], // ✅ FIXED
    required: true,
  },
  comment: String,
  decidedAt: {
    type: Date,
    default: Date.now,
  },
});

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate: Date,
    toDate: Date,
    leaveType: String,
    reason: String,

    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    votes: [voteSchema],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "tie"],
      default: "pending",
    },

    resolvedByHR: {
      type: Boolean,
      default: false,
    },

    hrDecision: {
      type: String,
      enum: ["approved", "rejected"],
    },

    hrDecidedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Leave || mongoose.model("Leave", leaveSchema);
