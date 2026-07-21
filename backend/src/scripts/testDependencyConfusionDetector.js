require("dotenv").config();
const mongoose = require("mongoose");
const { runDependencyConfusionDetection } = require("../detectors/dependencyConfusionDetector");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);

  const testDependencies = [
    { name: "express" },                          // normal public package, should be ignored
    { name: "internal-auth-service" },             // looks internal, likely doesn't exist -> low
    { name: "acme-private-billing" },              // looks internal via "private" keyword
    { name: "@mycompany-internal/payments" },      // unknown scope, looks internal
    { name: "@babel/core" },                       // known public scope, should be ignored
    { name: "lodash" },                             // exists, but doesn't look internal -> ignored
  ];

  const findings = await runDependencyConfusionDetection(testDependencies);

  console.log(`Found ${findings.length} dependency confusion findings out of ${testDependencies.length}:\n`);
  console.log(JSON.stringify(findings, null, 2));

  await mongoose.disconnect();
}

test();