import express from "express";
import { analyzeCode } from "./main.js";
import { CodeIssue } from "./types.js";

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
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
    }

    // Analyze the code
    const issues: CodeIssue[] = analyzeCode(code);

    // Return the results
    res.status(200).json({ issues });
  } catch (error) {
    console.error("Error analyzing code:", error);
    return res.status(500).json({
      error: "An error occurred during analysis",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`JSGuard API server running on port ${port}`);
  console.log(`POST /analyze - Analyze JavaScript code for issues`);
  console.log(`GET /health - Check API health status`);
});
