require("dotenv").config();
const mongoose = require("mongoose");
const { runTyposquatDetection } = require("../detectors/typosquatDetector");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);

  const testDependencies = [
    { name: "express" },
    { name: "expres" },
    { name: "reactt" },
    { name: "my-completely-unique-internal-tool" },
    { name: "@babel/core" },
  ];

  const findings = await runTyposquatDetection(testDependencies);

  console.log(`Found ${findings.length} suspicious dependencies out of ${testDependencies.length}:\n`);
  console.log(JSON.stringify(findings, null, 2));

  await mongoose.disconnect();
}

test();