import * as parser from "@babel/parser";
import { ParseResult, ParserOptions } from "@babel/parser";
import * as t from "@babel/types";
import { CodeIssue } from "./types.js";

import _traverse from "@babel/traverse";
const traverse = _traverse.default;

/**
 * Parses JavaScript code using Babel parser
 */
function parseJavaScript(jsCode: string): ParseResult | null {
  try {
    const options: ParserOptions = {
      sourceType: "module",
      plugins: ["typescript", "classProperties", "objectRestSpread"],
    };

    const ast = parser.parse(jsCode, options);

    return ast;
  } catch (error) {
    console.error("Error parsing JavaScript:", error);
    return null;
  }
}

/**
 * Analyzes JavaScript code for potential issues
 */
function analyzeCode(jsCode: string): CodeIssue[] {
  const ast = parseJavaScript(jsCode);
  const issues: CodeIssue[] = [];

  if (!ast) return issues;

  // Keep track of large functions to detect complexity issues
  const functionSizes: Map<any, number> = new Map();

  traverse(ast, {
    // Detect implicit globals (undeclared variables)
    AssignmentExpression(path) {
      if (
        t.isIdentifier(path.node.left) &&
        !path.scope.hasBinding(path.node.left.name)
      ) {
        issues.push({
          type: "error",
          severity: "high",
          message: `Implicit global variable: ${path.node.left.name}`,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }

      if (
        path.node.operator === "+=" &&
        t.isStringLiteral(path.node.right) &&
        path.findParent((p) => p.isLoop())
      ) {
        issues.push({
          type: "performance",
          severity: "medium",
          message:
            "Inefficient string concatenation in loop - consider using array.join() instead",
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }
    },

    // Detect unsafe equality comparisons
    BinaryExpression(path) {
      if (path.node.operator === "==" || path.node.operator === "!=") {
        issues.push({
          type: "error",
          severity: "medium",
          message: `Unsafe equality comparison using ${path.node.operator} instead of ${path.node.operator}=`,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }
    },

    // Detect potential XSS vulnerabilities
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property)
      ) {
        const propertyName = path.node.callee.property.name;
        if (
          ["innerHTML", "outerHTML"].includes(propertyName) ||
          propertyName === "insertAdjacentHTML"
        ) {
          issues.push({
            type: "security",
            severity: "high",
            message: `Potential XSS vulnerability using ${propertyName}`,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          });
        }

        // Detect insecure DOM methods like document.write
        if (
          t.isMemberExpression(path.node.callee.object) &&
          t.isIdentifier(path.node.callee.object.object) &&
          path.node.callee.object.object.name === "document" &&
          ["write", "writeln"].includes(propertyName)
        ) {
          issues.push({
            type: "security",
            severity: "high",
            message: `Insecure use of document.${propertyName}() - can enable XSS attacks`,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          });
        }
      }

      // Detect potentially dangerous setTimeout/setInterval with string arguments
      if (
        t.isIdentifier(path.node.callee) &&
        ["setTimeout", "setInterval"].includes(path.node.callee.name) &&
        path.node.arguments.length > 0 &&
        t.isStringLiteral(path.node.arguments[0])
      ) {
        const calleeName = path.node.callee.name;
        issues.push({
          type: "security",
          severity: "high",
          message: `Unsafe use of ${calleeName} with string argument - similar to eval()`,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }

      // Check for eval usage
      if (
        t.isIdentifier(path.node.callee) &&
        ["eval", "Function", "execScript"].includes(path.node.callee.name)
      ) {
        issues.push({
          type: "security",
          severity: "high",
          message: `Unsafe use of ${path.node.callee.name}() - can execute arbitrary code`,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }

      // Detect potentially insecure HTTP requests
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === "open" &&
        path.node.arguments.length >= 2 &&
        t.isStringLiteral(path.node.arguments[1]) &&
        path.node.arguments[1].value.startsWith("http://")
      ) {
        issues.push({
          type: "security",
          severity: "medium",
          message: "Using insecure HTTP protocol instead of HTTPS",
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }
    },

    // Detect unused variables for performance
    VariableDeclarator(path) {
      if (t.isIdentifier(path.node.id)) {
        const binding = path.scope.getBinding(path.node.id.name);
        if (binding && binding.references === 0) {
          issues.push({
            type: "performance",
            severity: "low",
            message: `Unused variable: ${path.node.id.name}`,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          });
        }
      }
    },

    // Detect var usage
    VariableDeclaration(path) {
      if (path.node.kind === "var") {
        issues.push({
          type: "style",
          severity: "medium",
          message:
            "Use of 'var' keyword - consider using 'let' or 'const' instead for better scoping",
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }
    },

    // Track function entry to count statements
    Function: {
      enter(path) {
        functionSizes.set(path, 0);
      },
      exit(path) {
        const size = functionSizes.get(path) || 0;
        if (size > 30) {
          issues.push({
            type: "performance",
            severity: "medium",
            message: `Function is too large (${size} statements) - consider refactoring for better maintainability`,
            line: path.node.loc?.start.line || 0,
            column: path.node.loc?.start.column || 0,
          });
        }
      },
    },

    // Count statements in functions
    Statement(path) {
      let parent = path.findParent((p) => p.isFunction());
      if (parent) {
        const currentCount = functionSizes.get(parent) || 0;
        functionSizes.set(parent, currentCount + 1);
      }
    },

    // Detect inefficient loops with array methods
    ForStatement(path) {
      const init = path.get("init");
      const test = path.get("test");

      if (
        init.isVariableDeclaration() &&
        test.isBinaryExpression() &&
        t.isMemberExpression(test.node.right) &&
        t.isIdentifier(test.node.right.property) &&
        test.node.right.property.name === "length"
      ) {
        issues.push({
          type: "performance",
          severity: "low",
          message:
            "Consider using array methods (forEach, map, filter, etc.) instead of traditional for loops",
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        });
      }
    },

    // Detect potentially dangerous object property access without checks
    MemberExpression(path) {
      if (
        !path.parentPath.isIfStatement() &&
        !path.parentPath.isConditionalExpression() &&
        !path.parentPath.isLogicalExpression() &&
        t.isIdentifier(path.node.object)
      ) {
        const safeObjects = [
          "console",
          "Math",
          "JSON",
          "document",
          "window",
          "process",
        ];
        if (!safeObjects.includes(path.node.object.name)) {
          const binding = path.scope.getBinding(path.node.object.name);
          if (!binding || binding.references > 1) {
            issues.push({
              type: "error",
              severity: "medium",
              message: `Potential TypeError: accessing property of undefined (${path.node.object.name})`,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
            });
          }
        }
      }
    },
  });

  return issues;
}

/**
 * Format issues for display
 */
function formatIssues(issues: CodeIssue[]): string {
  if (issues.length === 0) {
    return "No issues detected.";
  }

  return issues
    .map(
      (issue) =>
        `[${issue.severity.toUpperCase()}] ${issue.type}: ${
          issue.message
        } at line ${issue.line}, column ${issue.column}`
    )
    .join("\n");
}

export { parseJavaScript, analyzeCode, formatIssues };
