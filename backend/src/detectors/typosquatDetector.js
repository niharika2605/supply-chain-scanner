const levenshtein = require("fast-levenshtein");
const PopularPackage = require("../models/PopularPackage");
const { getPackageMetadata } = require("../services/npmRegistryService");

const MAX_SUSPICIOUS_DISTANCE = 2;
const YOUNG_PACKAGE_DAYS = 90;
const LOW_DOWNLOAD_THRESHOLD = 1000;

/**
 * Splits a package name into its scope (if any) and base name.
 * "@babel/core" -> { scope: "@babel", baseName: "core" }
 * "express" -> { scope: null, baseName: "express" }
 */
function splitScope(packageName) {
  if (packageName.startsWith("@") && packageName.includes("/")) {
    const [scope, ...rest] = packageName.split("/");
    return { scope, baseName: rest.join("/") };
  }
  return { scope: null, baseName: packageName };
}

/**
 * Fetches the full popular packages list ONCE. Callers should fetch this
 * a single time per scan and pass it into checkTyposquat, instead of each
 * call hitting MongoDB separately.
 */
async function loadPopularPackages() {
  return PopularPackage.find({}).lean();
}

/**
 * Converts a severity label + distance + metadata into a 0-100 numeric score.
 * Higher score = higher risk.
 */
function calculateRiskScore({ distance, isYoung, isLowDownloads, packageExists }) {
  let score = 0;

  // Closer distance = higher base risk
  score += distance === 1 ? 50 : 30;

  if (!packageExists) {
    // Doesn't exist yet — real risk, but not currently exploitable
    return Math.min(score, 40);
  }

  if (isYoung) score += 25;
  if (isLowDownloads) score += 25;

  return Math.min(score, 100);
}

/**
 * Checks a single dependency name against an already-loaded list of
 * popular packages (pass the result of loadPopularPackages() here).
 */
async function checkTyposquat(dependencyName, popularPackagesList) {
  const { scope: depScope, baseName: depBaseName } = splitScope(dependencyName);

  let closestMatch = null;
  let closestDistance = Infinity;

  for (const popular of popularPackagesList) {
    if (popular.name === dependencyName) {
      return null; // exact match, safe
    }

    const { scope: popScope, baseName: popBaseName } = splitScope(popular.name);

    // Only compare within the same "scope shape" — both scoped or both unscoped.
    // Prevents comparing "@babel/core" against unrelated unscoped packages.
    if ((depScope === null) !== (popScope === null)) {
      continue;
    }

    if (Math.abs(popBaseName.length - depBaseName.length) > MAX_SUSPICIOUS_DISTANCE) {
      continue;
    }

    const distance = levenshtein.get(depBaseName, popBaseName);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestMatch = popular;
    }
  }

  if (!closestMatch || closestDistance === 0 || closestDistance > MAX_SUSPICIOUS_DISTANCE) {
    return null;
  }

  const metadata = await getPackageMetadata(dependencyName);

  if (!metadata.exists) {
    const riskScore = calculateRiskScore({
      distance: closestDistance,
      isYoung: false,
      isLowDownloads: false,
      packageExists: false,
    });

    return {
      type: "typosquat",
      dependencyName,
      similarTo: closestMatch.name,
      distance: closestDistance,
      severity: "low",
      riskScore,
      reason: `"${dependencyName}" is very similar to popular package "${closestMatch.name}" but does not currently exist on npm. Low risk now, but could be registered later.`,
    };
  }

  const ageInDays = metadata.createdAt
    ? (Date.now() - new Date(metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : null;

  const isYoung = ageInDays !== null && ageInDays < YOUNG_PACKAGE_DAYS;
  const isLowDownloads = metadata.weeklyDownloads < LOW_DOWNLOAD_THRESHOLD;

  const riskScore = calculateRiskScore({
    distance: closestDistance,
    isYoung,
    isLowDownloads,
    packageExists: true,
  });

  let severity = "medium";
  if (riskScore >= 70) severity = "high";
  else if (riskScore <= 30) severity = "low";

  return {
    type: "typosquat",
    dependencyName,
    similarTo: closestMatch.name,
    distance: closestDistance,
    severity,
    riskScore,
    packageAgeInDays: ageInDays ? Math.round(ageInDays) : null,
    weeklyDownloads: metadata.weeklyDownloads,
    reason: `"${dependencyName}" is ${closestDistance} character(s) different from popular package "${closestMatch.name}". ${
      isYoung ? "Recently published" : "Established package"
    }, ${metadata.weeklyDownloads} weekly downloads.`,
  };
}

/**
 * Runs typosquat detection across a full list of dependencies.
 * Loads the popular packages list ONCE, then reuses it for every check.
 */
async function runTyposquatDetection(dependencies) {
  const popularPackagesList = await loadPopularPackages();
  const findings = [];

  for (const dep of dependencies) {
    const result = await checkTyposquat(dep.name, popularPackagesList);
    if (result) {
      findings.push(result);
    }
  }

  return findings;
}

module.exports = { checkTyposquat, runTyposquatDetection, loadPopularPackages };