const express = require("express");
const { body, validationResult } = require("express-validator");
const Medication = require("../models/Medication");
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

// @route  POST /api/medications  (doctor prescribes for their assigned patient)
router.post(
  "/",
  protect,
  authorize("doctor", "admin"),
  [
    body("patient").notEmpty(),
    body("name").trim().notEmpty(),
    body("dosage").trim().notEmpty(),
    body("frequency").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const allowed = await canAccessPatient(req.user, req.body.patient);
      if (!allowed) return res.status(403).json({ message: "Forbidden: not your patient" });

      const { patient, name, dosage, frequency, startDate, endDate, instructions } = req.body;
      const medication = await Medication.create({
        patient,
        prescribedBy: req.user._id,
        name,
        dosage,
        frequency,
        startDate,
        endDate,
        instructions,
      });
      res.status(201).json(medication);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route  GET /api/medications/patient/:patientId
router.get("/patient/:patientId", protect, async (req, res) => {
  try {
    const allowed = await canAccessPatient(req.user, req.params.patientId);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const meds = await Medication.find({ patient: req.params.patientId })
      .populate("prescribedBy", "name specialization")
      .sort({ createdAt: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PATCH /api/medications/:id  (doctor/admin updates - e.g. mark inactive)
router.patch("/:id", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ message: "Medication not found" });

    const allowed = await canAccessPatient(req.user, medication.patient);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    const updatable = ["dosage", "frequency", "endDate", "active", "instructions"];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) medication[field] = req.body[field];
    });
    await medication.save();
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
