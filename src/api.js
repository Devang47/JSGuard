import express from "express";
import { analyzeCode } from "./main.js";

const app = express();
const port = 3000;

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "50mb" }));

// Health check endpoint
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});

// Main analyze endpoint
app.post("/analyze", (req, res) => {
  try {
    // Get code from request body
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      res.status(400).json({
        error: "Missing or invalid 'code' property in request body",
      });
      return;
    }

    // Analyze the code
    const issues = analyzeCode(code);

    // Return the results
    res.status(200).json({ issues });
  } catch (error) {
    console.error("Error analyzing code:", error);
    res.status(500).json({
      error: "An error occurred during analysis",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start the server - listen on all interfaces (0.0.0.0)
const server = app.listen(3000, () => {
  console.log(`JSGuard API server running at http://localhost:${port}`);
  console.log("POST /analyze - Analyze JavaScript code for issues");
  console.log("GET /health - Check API health status");
});
