const axios = require("axios");

const REGISTRY_BASE_URL = "https://registry.npmjs.org";
const DOWNLOADS_BASE_URL = "https://api.npmjs.org/downloads/point/last-week";

/**
 * Fetches metadata for a single npm package: publish dates, latest version,
 * maintainers, and recent download count.
 *
 * Returns { exists: false } (with lookupFailed: true) for ANY failure —
 * whether the package genuinely doesn't exist (404), the name is malformed
 * and npm rejects it (405, 400), or there's a network issue. A single bad
 * dependency name should never crash the whole scan.
 */
async function getPackageMetadata(packageName) {
  try {
    const registryResponse = await axios.get(
      `${REGISTRY_BASE_URL}/${encodeURIComponent(packageName)}`
    );

    const data = registryResponse.data;

    const latestVersion = data["dist-tags"]?.latest;
    const versions = data.time || {};

    const createdAt = versions.created;
    const latestPublishedAt = latestVersion ? versions[latestVersion] : null;

    const maintainers = data.maintainers?.map((m) => m.name) || [];

    let weeklyDownloads = 0;
    try {
      const downloadsResponse = await axios.get(
        `${DOWNLOADS_BASE_URL}/${encodeURIComponent(packageName)}`
      );
      weeklyDownloads = downloadsResponse.data.downloads || 0;
    } catch (downloadErr) {
      weeklyDownloads = 0;
    }

    return {
      packageName,
      exists: true,
      createdAt,
      latestVersion,
      latestPublishedAt,
      maintainers,
      weeklyDownloads,
    };
  } catch (err) {
    return {
      packageName,
      exists: false,
      lookupFailed: true,
      lookupError: err.message,
    };
  }
}

module.exports = { getPackageMetadata };