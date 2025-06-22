// Quick test script to verify what the parser can handle
import { parseJavaScript, analyzeCode, formatIssues } from '../src/main.js';

// Test the supported syntax
const supportedCode = `
var x = 42;
let name = "John";
const PI = 3.14;

function greet(person) {
  console.log("Hello " + person);
}

greet("World");

var element = document.getElementById("test");
element.innerHTML = userInput;
eval("dangerous code");
`;

console.log("=== PARSING TEST ===");
try {
  const ast = parseJavaScript(supportedCode);
  console.log("✅ Parsing successful!");
  console.log("AST node count:", JSON.stringify(ast, null, 2).length);
} catch (error) {
  console.log("❌ Parsing failed:", error.message);
}

console.log("\n=== ANALYSIS TEST ===");
try {
  const issues = analyzeCode(supportedCode);
  console.log("✅ Analysis successful!");
  console.log(`Found ${issues.length} issues:`);
  console.log(formatIssues(issues));
} catch (error) {
  console.log("❌ Analysis failed:", error.message);
}

// Test unsupported syntax (should not crash)
const unsupportedCode = `
const arrow = () => console.log("arrow function");
const obj = { key: "value" };
const [a, b] = array;
`;

console.log("\n=== UNSUPPORTED SYNTAX TEST ===");
try {
  const ast = parseJavaScript(unsupportedCode);
  console.log("✅ Parsing didn't crash (good error recovery)");
  
  const issues = analyzeCode(unsupportedCode);
  console.log(`Analysis completed with ${issues.length} issues`);
} catch (error) {
  console.log("⚠️  Parser/analyzer had issues:", error.message);
}
