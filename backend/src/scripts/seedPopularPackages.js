require("dotenv").config();
const mongoose = require("mongoose");
const downloadCounts = require("download-counts");
const PopularPackage = require("../models/PopularPackage");

const TOP_N = 5000;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  // downloadCounts is a giant object: { "package-name": downloadNumber, ... }
  // Convert it to an array, sort by downloads descending, take the top N
  const sortedPackages = Object.entries(downloadCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, TOP_N)
    .map(([name, monthlyDownloads], index) => ({
      name,
      monthlyDownloads,
      rank: index + 1,
    }));

  console.log(`Prepared ${sortedPackages.length} packages. Clearing old data...`);

  // Wipe old cache before inserting fresh data
  await PopularPackage.deleteMany({});

  // insertMany is much faster than saving one by one for 5000 records
  await PopularPackage.insertMany(sortedPackages);

  console.log(`Seeded ${sortedPackages.length} popular packages into MongoDB`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});