const { parsePackageJson } = require("../utils/packageParser");
const { runTyposquatDetection } = require("../detectors/typosquatDetector");
const { runDependencyConfusionDetection } = require("../detectors/dependencyConfusionDetector");
const { enrichFindingsWithAI } = require("./claudeService");

const MAX_DEPENDENCIES_PER_SCAN = 150;

async function runFullScan(packageJsonContent) {
  const { projectName, totalDependencies, dependencies } =
    parsePackageJson(packageJsonContent);

  if (totalDependencies > MAX_DEPENDENCIES_PER_SCAN) {
    throw new Error(
      `Too many dependencies (${totalDependencies}). This scanner supports up to ${MAX_DEPENDENCIES_PER_SCAN} dependencies per scan.`
    );
  }

  const [typosquatFindings, dependencyConfusionFindings] = await Promise.all([
    runTyposquatDetection(dependencies),
    runDependencyConfusionDetection(dependencies),
  ]);

  let allFindings = [...typosquatFindings, ...dependencyConfusionFindings];

  allFindings.sort((a, b) => b.riskScore - a.riskScore);

  // Enrich with AI explanations — this call has its own internal
  // try/catch (from Day 12), so if it fails, allFindings just comes
  // back unchanged with explanation fields set to null. The scan
  // itself never fails because of this step.
  allFindings = await enrichFindingsWithAI(allFindings);

  const overallRiskScore =
    allFindings.length > 0
      ? Math.max(...allFindings.map((f) => f.riskScore))
      : 0;

  return {
    projectName,
    totalDependencies,
    totalFindings: allFindings.length,
    overallRiskScore,
    findings: allFindings,
    scannedAt: new Date(),
  };
}

module.exports = { runFullScan };