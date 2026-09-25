const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["mild", "moderate", "severe"], default: "mild" },
    date: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Symptom", symptomSchema);
