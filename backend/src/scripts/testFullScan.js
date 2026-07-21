require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { runFullScan } = require("../services/scanService");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);

  const testFilesDir = path.join(__dirname, "test-files");
  const files = fs.readdirSync(testFilesDir);

  for (const file of files) {
    const filePath = path.join(testFilesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    console.log(`\n===== Scanning ${file} =====`);

    const startTime = Date.now();
    const result = await runFullScan(content);
    const durationMs = Date.now() - startTime;

    console.log(`Project: ${result.projectName}`);
    console.log(`Total dependencies scanned: ${result.totalDependencies}`);
    console.log(`Findings: ${result.totalFindings}`);
    console.log(`Overall risk score: ${result.overallRiskScore}`);
    console.log(`Scan took: ${durationMs}ms`);

    if (result.findings.length > 0) {
      console.log("\nTop findings:");
      result.findings.slice(0, 5).forEach((f) => {
        console.log(`  [${f.severity.toUpperCase()}] ${f.dependencyName} (score: ${f.riskScore}) - ${f.type}`);
      });
    }
  }

  await mongoose.disconnect();
}

test();