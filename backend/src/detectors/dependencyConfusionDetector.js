const { getPackageMetadata } = require("../services/npmRegistryService");

// Keywords/patterns commonly seen in internal/private package names.
// This list is intentionally simple and can be extended later.
const INTERNAL_NAME_PATTERNS = [
  /internal/i,
  /private/i,
  /-corp-/i,
  /^corp-/i,
  /-inhouse-/i,
  /^inhouse-/i,
  /-proprietary-/i,
];

// Well-known public scopes that are NOT considered "internal-looking"
// even though they start with @ (avoids false positives on legit packages).
const KNOWN_PUBLIC_SCOPES = [
  "@babel",
  "@types",
  "@angular",
  "@vue",
  "@testing-library",
  "@aws-sdk",
];

/**
 * Decides whether a package name "looks" like it was meant to be an
 * internal/private package, based on naming patterns.
 */
function looksInternal(packageName) {
  // Scoped packages: flag if the scope isn't a known public one
  if (packageName.startsWith("@") && packageName.includes("/")) {
    const scope = packageName.split("/")[0];
    if (!KNOWN_PUBLIC_SCOPES.includes(scope)) {
      return true;
    }
  }

  // Unscoped packages: check against keyword patterns
  return INTERNAL_NAME_PATTERNS.some((pattern) => pattern.test(packageName));
}

/**
 * Checks a single dependency for dependency confusion risk.
 * Returns null if it doesn't look internal, or a finding object if it does.
 */
async function checkDependencyConfusion(dependencyName) {
  if (!looksInternal(dependencyName)) {
    return null;
  }

  const metadata = await getPackageMetadata(dependencyName);

  if (metadata.exists) {
    // This is the dangerous case: a name that looks internal is
    // actually claimed publicly. Could be an attacker-planted package,
    // or an innocent public package that happens to match your naming style.
    return {
      type: "dependency_confusion",
      dependencyName,
      severity: "high",
      riskScore: 85,
      publicPackageExists: true,
      weeklyDownloads: metadata.weeklyDownloads,
      packageAgeInDays: metadata.createdAt
        ? Math.round((Date.now() - new Date(metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : null,
      reason: `"${dependencyName}" looks like an internal/private package name, but it already exists publicly on npm (${metadata.weeklyDownloads} weekly downloads). If your build ever resolves this name from the public registry instead of your private one, this is a dependency confusion risk.`,
    };
  }

  // Looks internal and does NOT exist publicly yet — currently safe,
  // but worth flagging so the name gets claimed/reserved proactively.
  return {
    type: "dependency_confusion",
    dependencyName,
    severity: "low",
    riskScore: 20,
    publicPackageExists: false,
    reason: `"${dependencyName}" looks like an internal/private package name and does not currently exist publicly on npm. Consider registering this name publicly (even as an empty placeholder) to prevent future squatting.`,
  };
}

/**
 * Runs dependency confusion detection across a full list of dependencies.
 */
async function runDependencyConfusionDetection(dependencies) {
  const findings = [];

  for (const dep of dependencies) {
    const result = await checkDependencyConfusion(dep.name);
    if (result) {
      findings.push(result);
    }
  }

  return findings;
}

module.exports = {
  checkDependencyConfusion,
  runDependencyConfusionDetection,
  looksInternal,
};