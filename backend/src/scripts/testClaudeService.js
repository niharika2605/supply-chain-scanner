require("dotenv").config();
const { enrichFindingsWithAI } = require("../services/claudeService");

async function test() {
  const sampleFindings = [
    {
      type: "typosquat",
      dependencyName: "reactt",
      severity: "high",
      riskScore: 75,
      reason: '"reactt" is 1 character(s) different from popular package "react". Established package, 19 weekly downloads.',
    },
    {
      type: "dependency_confusion",
      dependencyName: "acme-private-billing",
      severity: "low",
      riskScore: 20,
      reason: '"acme-private-billing" looks like an internal/private package name and does not currently exist publicly on npm.',
    },
  ];

  const enriched = await enrichFindingsWithAI(sampleFindings);
  console.log(JSON.stringify(enriched, null, 2));
}

test();