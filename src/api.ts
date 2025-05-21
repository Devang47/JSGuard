import express, { Request, Response, NextFunction } from "express";
import { analyzeCode } from "./main.js";
import { CodeIssue } from "./types.js";

// Create Express app
const app = express();
// Fix the port type issue by ensuring it's always a number
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Request body interface
interface AnalyzeRequest {
  code?: string;
}

// Response interfaces
interface HealthResponse {
  status: string;
}

interface AnalyzeResponse {
  issues: CodeIssue[];
}

interface ErrorResponse {
  error: string;
  message?: string;
}

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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

// Middleware for parsing JSON bodies
app.use(express.json({ limit: "50mb" }));

// Health check endpoint
app.get("/health", (_: Request, res: Response<HealthResponse>) => {
  res.status(200).json({ status: "ok" });
});

// Main analyze endpoint - fixed the TypeScript error by using void return type
app.post(
  "/analyze",
  (req: Request, res: Response<AnalyzeResponse | ErrorResponse>): void => {
    try {
      // Get code from request body
      const { code } = req.body as AnalyzeRequest;

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
  }
);

// Start the server - listen on all interfaces (0.0.0.0)
const server = app.listen(port, "0.0.0.0", () => {
  // Get the server's address info
  const addressInfo = server.address();
  const hostAddress =
    typeof addressInfo === "string"
      ? addressInfo
      : `${
          addressInfo?.address === "::" ? "localhost" : addressInfo?.address
        }:${addressInfo?.port}`;

  console.log(`JSGuard API server running at http://${hostAddress}`);
  console.log("Available on your network:");
  console.log("POST /analyze - Analyze JavaScript code for issues");
  console.log("GET /health - Check API health status");
});
