const mongoose = require("mongoose");

// A single finding — flexible enough to hold fields from either detector
// (typosquat findings and dependency confusion findings have some
// different fields, so we don't rigidly require every field).
const findingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["typosquat", "dependency_confusion"],
    },
    dependencyName: { type: String, required: true },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },
    riskScore: { type: Number, required: true },
    reason: { type: String, required: true },

    // Fields specific to typosquat findings
    similarTo: { type: String },
    distance: { type: Number },

    // Fields specific to dependency confusion findings
    publicPackageExists: { type: Boolean },

    // Shared optional metadata fields
    packageAgeInDays: { type: Number },
    weeklyDownloads: { type: Number },

    // AI-generated fields — optional since AI enrichment can fail
    plainEnglishExplanation: { type: String, default: null },
    remediationSteps: { type: String, default: null },
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  totalDependencies: {
    type: Number,
    required: true,
  },
  totalFindings: {
    type: Number,
    required: true,
  },
  overallRiskScore: {
    type: Number,
    required: true,
  },
  findings: [findingSchema],
  scannedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Scan", scanSchema);