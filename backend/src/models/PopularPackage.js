const mongoose = require("mongoose");

const popularPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  monthlyDownloads: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("PopularPackage", popularPackageSchema);