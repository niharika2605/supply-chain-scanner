const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const scanRoutes = require("./routes/scanRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api", scanRoutes);

module.exports = app;