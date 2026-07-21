require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { runFullScan } = require("../services/scanService");
const Scan = require("../models/Scan");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);

  const filePath = path.join(__dirname, "test-files", "intentionally-risky.json");
  const content = fs.readFileSync(filePath, "utf-8");

  const scanResult = await runFullScan(content);

  const savedScan = await Scan.create(scanResult);

  console.log("Scan saved successfully with ID:", savedScan._id);
  console.log("Saved document:", JSON.stringify(savedScan, null, 2));

  await mongoose.disconnect();
}

test();