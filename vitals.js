const express = require("express");
const { body, validationResult } = require("express-validator");
const VitalLog = require("../models/VitalLog");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Helper: can the requesting user access this patient's data?
const canAccessPatient = async (requester, patientId) => {
  if (requester.role === "admin") return true;
  if (requester.role === "patient") return String(requester._id) === String(patientId);
  if (requester.role === "doctor") {
    const patient = await User.findById(patientId);
    return patient && String(patient.assignedDoctor) === String(requester._id);
  }
  return false;
};

// @route  POST /api/vitals  (patient logs their own vital)
router.post(
  "/",
  protect,
  authorize("patient"),
  [
    body("type").isIn(["blood_pressure", "heart_rate", "glucose", "weight", "temperature", "oxygen_saturation"]),
    body("value").isNumeric(),
    body("unit").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { type, value, secondaryValue, unit, recordedAt, notes } = req.body;
      const log = await VitalLog.create({
        patient: req.user._id,
        type,
        value,
        secondaryValue,
        unit,
        recordedAt,
        notes,
      });
      res.status(201).json(log);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route  GET /api/vitals/patient/:patientId  (own logs, or doctor/admin viewing assigned patient)
router.get("/patient/:patientId", protect, async (req, res) => {
  try {
    const allowed = await canAccessPatient(req.user, req.params.patientId);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const { type } = req.query;
    const filter = { patient: req.params.patientId };
    if (type) filter.type = type;

    const logs = await VitalLog.find(filter).sort({ recordedAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  DELETE /api/vitals/:id  (patient deletes their own log)
router.delete("/:id", protect, authorize("patient"), async (req, res) => {
  try {
    const log = await VitalLog.findOne({ _id: req.params.id, patient: req.user._id });
    if (!log) return res.status(404).json({ message: "Log not found" });
    await log.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
