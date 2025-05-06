import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { analyzeCode, formatIssues } from "./main.js";

// Set up the command-line interface
const program = new Command();

program
  .name("jsguard")
  .description("JavaScript static code analyzer to detect potential issues")
  .version("1.0.0");

program
  .argument("<file>", "JavaScript file to analyze")
  .option("-o, --output <file>", "Save output to a file instead of stdout")
  .action(async (file, options) => {
    try {
      // Resolve the file path
      const filePath = path.resolve(process.cwd(), file);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
      }

      // Read the file content
      const fileContent = fs.readFileSync(filePath, "utf-8");

      // Analyze the code
      const issues = analyzeCode(fileContent);

      // Format the issues
      const formattedIssues = formatIssues(issues);

      // Output results
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outputPath, formattedIssues);
        console.log(`Analysis complete. Results saved to ${outputPath}`);
      } else {
        console.log("\nAnalysis Results:");
        console.log("----------------");
        console.log(formattedIssues);

        // Print a summary
        const issuesByType = issues.reduce((acc, issue) => {
          acc[issue.type] = (acc[issue.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log("\nSummary:");
        console.log(`Total issues: ${issues.length}`);
        Object.entries(issuesByType).forEach(([type, count]) => {
          console.log(`- ${type}: ${count}`);
        });
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      process.exit(1);
    }
  });

program.parse();
