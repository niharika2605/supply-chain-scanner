const express = require("express");
const router = express.Router();

const { runFullScan } = require("../services/scanService");
const Scan = require("../models/Scan");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/authMiddleware");

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many scan requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/scan", requireAuth, scanLimiter, async (req, res) => {
  const { packageJsonContent } = req.body;

  if (!packageJsonContent) {
    return res.status(400).json({
      error: "Missing packageJsonContent in request body",
    });
  }

  try {
    const scanResult = await runFullScan(packageJsonContent);

    const savedScan = await Scan.create({
      ...scanResult,
      userId: req.userId,
    });

    return res.status(201).json(savedScan);
  } catch (err) {
    const isClientError =
      err.message.includes("Invalid package.json") ||
      err.message.includes("No dependencies found") ||
      err.message.includes("Too many dependencies");

    if (isClientError) {
      return res.status(400).json({ error: err.message });
    }

    console.error("Scan failed:", err);
    return res.status(500).json({ error: "Scan failed due to a server error" });
  }
});

router.get("/scan/history", requireAuth, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.userId })
      .sort({ scannedAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json(scans);
  } catch (err) {
    console.error("Failed to fetch scan history:", err);
    return res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

router.get("/scan/:id", requireAuth, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    return res.status(200).json(scan);
  } catch (err) {
    console.error("Failed to fetch scan:", err);
    return res.status(500).json({ error: "Failed to fetch scan" });
  }
});

module.exports = router;