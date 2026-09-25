const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/users  (admin only - list all users, optional ?role= filter)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/users/doctors  (anyone logged in can see the list of doctors, e.g. for display)
router.get("/doctors", protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("name specialization email");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/users/my-patients  (doctor - list patients assigned to them)
router.get("/my-patients", protect, authorize("doctor"), async (req, res) => {
  try {
    const patients = await User.find({ role: "patient", assignedDoctor: req.user._id }).select("-password");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PATCH /api/users/:id/assign-doctor  (admin assigns a doctor to a patient)
router.patch("/:id/assign-doctor", protect, authorize("admin"), async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (doctorId) {
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(400).json({ message: "Invalid doctor id" });
      }
    }

    patient.assignedDoctor = doctorId || null;
    await patient.save();
    res.json(patient.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PATCH /api/users/:id/status  (admin activates/deactivates a user)
router.patch("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = req.body.isActive;
    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/users/:id  (view a single user's profile - self, admin, or assigned doctor)
router.get("/:id", protect, async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select("-password");
    if (!target) return res.status(404).json({ message: "User not found" });

    const isSelf = String(req.user._id) === String(target._id);
    const isAdmin = req.user.role === "admin";
    const isAssignedDoctor =
      req.user.role === "doctor" && String(target.assignedDoctor) === String(req.user._id);

    if (!isSelf && !isAdmin && !isAssignedDoctor) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
