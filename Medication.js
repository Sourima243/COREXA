const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true },
    instructions: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
