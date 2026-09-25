const express = require("express");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/notes  (doctor adds a clinical note for their assigned patient)
router.post(
  "/",
  protect,
  authorize("doctor"),
  [body("patient").notEmpty(), body("content").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const patient = await User.findById(req.body.patient);
      if (!patient || String(patient.assignedDoctor) !== String(req.user._id)) {
        return res.status(403).json({ message: "Forbidden: not your patient" });
      }

      const note = await Note.create({
        patient: req.body.patient,
        doctor: req.user._id,
        content: req.body.content,
      });
      res.status(201).json(note);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// @route  GET /api/notes/patient/:patientId  (patient sees their own notes; doctor/admin too)
router.get("/patient/:patientId", protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const isSelf = req.user.role === "patient" && String(req.user._id) === patientId;
    const isAdmin = req.user.role === "admin";
    let isAssignedDoctor = false;

    if (req.user.role === "doctor") {
      const patient = await User.findById(patientId);
      isAssignedDoctor = patient && String(patient.assignedDoctor) === String(req.user._id);
    }

    if (!isSelf && !isAdmin && !isAssignedDoctor) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const notes = await Note.find({ patient: patientId })
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
