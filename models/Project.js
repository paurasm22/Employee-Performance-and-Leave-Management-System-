import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    department: String,

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
