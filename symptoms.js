const express = require("express");
const { body, validationResult } = require("express-validator");
const Symptom = require("../models/Symptom");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const canAccessPatient = async (requester, patientId) => {
  if (requester.role === "admin") return true;
  if (requester.role === "patient") return String(requester._id) === String(patientId);
  if (requester.role === "doctor") {
    const patient = await User.findById(patientId);
    return patient && String(patient.assignedDoctor) === String(requester._id);
  }
  return false;
};

// @route  POST /api/symptoms
router.post(
  "/",
  protect,
  authorize("patient"),
  [body("description").trim().notEmpty(), body("severity").optional().isIn(["mild", "moderate", "severe"])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { description, severity, date } = req.body;
      const symptom = await Symptom.create({ patient: req.user._id, description, severity, date });
      res.status(201).json(symptom);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route  GET /api/symptoms/patient/:patientId
router.get("/patient/:patientId", protect, async (req, res) => {
  try {
    const allowed = await canAccessPatient(req.user, req.params.patientId);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const symptoms = await Symptom.find({ patient: req.params.patientId }).sort({ date: -1 });
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PATCH /api/symptoms/:id/resolve  (patient marks symptom resolved)
router.patch("/:id/resolve", protect, authorize("patient"), async (req, res) => {
  try {
    const symptom = await Symptom.findOne({ _id: req.params.id, patient: req.user._id });
    if (!symptom) return res.status(404).json({ message: "Symptom not found" });
    symptom.resolved = true;
    await symptom.save();
    res.json(symptom);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  DELETE /api/symptoms/:id
router.delete("/:id", protect, authorize("patient"), async (req, res) => {
  try {
    const symptom = await Symptom.findOne({ _id: req.params.id, patient: req.user._id });
    if (!symptom) return res.status(404).json({ message: "Symptom not found" });
    await symptom.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
