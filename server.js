require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const vitalRoutes = require("./routes/vitals");
const symptomRoutes = require("./routes/symptoms");
const medicationRoutes = require("./routes/medications");
const noteRoutes = require("./routes/notes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vitals", vitalRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/notes", noteRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
