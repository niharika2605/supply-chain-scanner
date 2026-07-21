const { getPackageMetadata } = require("../services/npmRegistryService");

async function test() {
  const result1 = await getPackageMetadata("express");
  console.log("express:", result1);

  const result2 = await getPackageMetadata("this-package-should-not-exist-xyz123");
  console.log("fake package:", result2);
}

test();