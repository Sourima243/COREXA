const mongoose = require("mongoose");

const vitalLogSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["blood_pressure", "heart_rate", "glucose", "weight", "temperature", "oxygen_saturation"],
      required: true,
    },
    // For blood_pressure, value holds systolic and secondaryValue holds diastolic
    value: { type: Number, required: true },
    secondaryValue: { type: Number },
    unit: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

vitalLogSchema.index({ patient: 1, type: 1, recordedAt: -1 });

module.exports = mongoose.model("VitalLog", vitalLogSchema);
