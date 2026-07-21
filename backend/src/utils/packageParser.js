/**
 * Parses a package.json file's content and extracts all dependencies
 * (both regular and dev dependencies) as a flat list.
 */

function parsePackageJson(packageJsonContent) {
  let parsed;

  try {
    parsed =
      typeof packageJsonContent === "string"
        ? JSON.parse(packageJsonContent)
        : packageJsonContent;
  } catch (err) {
    throw new Error("Invalid package.json: could not parse JSON");
  }

  const dependencies = parsed.dependencies || {};
  const devDependencies = parsed.devDependencies || {};

  const allDeps = [];

  for (const [name, versionRange] of Object.entries(dependencies)) {
    allDeps.push({ name, versionRange, type: "dependency" });
  }

  for (const [name, versionRange] of Object.entries(devDependencies)) {
    allDeps.push({ name, versionRange, type: "devDependency" });
  }

  if (allDeps.length === 0) {
    throw new Error("No dependencies found in package.json");
  }

  return {
    projectName: parsed.name || "unknown",
    totalDependencies: allDeps.length,
    dependencies: allDeps,
  };
}

module.exports = { parsePackageJson };