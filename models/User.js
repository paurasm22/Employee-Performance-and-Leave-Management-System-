import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  empNumber: { type: String, unique: true },
  name: String,
  password: String,
  role: {
    type: String,
    enum: ["hr", "manager", "employee"],
    default: "employee",
  },
  department: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
